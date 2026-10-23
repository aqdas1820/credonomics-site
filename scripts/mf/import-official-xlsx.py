"""Append validated official equity snapshots without rewriting historical holdings.

Input: a directory with downloaded issuer XLSX files and sources.json containing
path, url and sha256. Uses the standard library; never evaluates workbook formulas.
"""
import argparse
import collections
import datetime
import hashlib
import json
from pathlib import Path
import re
import urllib.parse
import xml.etree.ElementTree as ET
import zipfile

NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
SCHEMES = [
    ('Small Cap', 'HDFC Small Cap Fund', 'Small Cap'),
    ('Multi Cap', 'HDFC Multi Cap Fund', 'Multi Cap'),
    ('Large  Mid Cap', 'HDFC Large and Mid Cap Fund', 'Large & Mid Cap'),
    ('Mid Cap', 'HDFC Mid Cap Fund', 'Mid Cap'),
    ('Focused', 'HDFC Focused Fund', 'Focused'),
    ('Flexi Cap', 'HDFC Flexi Cap Fund', 'Flexi Cap'),
]


def slug(value):
    return re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')


def isin_valid(value):
    if not re.fullmatch(r'IN[A-Z0-9]{10}', value):
        return False
    digits = ''.join(str(ord(c) - 55) if c.isalpha() else c for c in value)
    return sum((2 * int(c) // 10 + 2 * int(c) % 10) if i % 2 else int(c)
               for i, c in enumerate(reversed(digits))) % 10 == 0


def rows_from_xlsx(file):
    with zipfile.ZipFile(file) as z:
        strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            strings = [''.join(t.itertext()) for t in ET.fromstring(z.read('xl/sharedStrings.xml'))]
        root = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        for row in root.findall('.//s:sheetData/s:row', NS):
            values = {}
            for c in row.findall('s:c', NS):
                col = re.sub(r'\d', '', c.attrib['r'])
                v = c.find('s:v', NS)
                value = v.text if v is not None else ''
                if c.attrib.get('t') == 's':
                    value = strings[int(value)]
                elif c.attrib.get('t') == 'inlineStr':
                    value = ''.join(c.find('s:is', NS).itertext())
                values[col] = value or ''
            yield int(row.attrib['r']), values


def write(file, value):
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def main():
    args = argparse.ArgumentParser()
    args.add_argument('--input', required=True)
    args.add_argument('--month', required=True)
    args.add_argument('--root', default='public/data/mf-intelligence/v2')
    args = args.parse_args()
    if not re.fullmatch(r'\d{4}-(0[1-9]|1[0-2])', args.month):
        raise ValueError('Invalid report month')
    target = Path(args.root)
    destination = target / 'by-month' / (args.month + '.json')
    if destination.exists():
        raise ValueError('Snapshot already exists. Review a correction explicitly instead of overwriting it.')
    sources = json.loads((Path(args.input) / 'sources.json').read_text())
    holdings, audits, seen = [], [], set()
    for source in sources:
        file = Path(source['path'])
        if hashlib.sha256(file.read_bytes()).hexdigest() != source['sha256']:
            raise ValueError('Source checksum mismatch')
        filename = urllib.parse.unquote(urllib.parse.urlparse(source['url']).path.rsplit('/', 1)[-1])
        matches = [(n, c) for token, n, c in SCHEMES if token in filename]
        # Large/Mid also matches Mid; longest canonical match wins.
        scheme, category = max(matches, key=lambda x: len(x[0]))
        rows = list(rows_from_xlsx(file))
        date_text = ' '.join(str(v) for _, r in rows[:3] for v in r.values())
        expected = datetime.date.fromisoformat(args.month + '-01')
        if expected.strftime('%b-%Y') not in date_text:
            raise ValueError(f'Report date does not match {args.month}: {filename}')
        active, subtotal, extracted, unquantified = False, None, [], []
        for row_number, row in rows:
            code = row.get('B', '').strip()
            if code == 'EQUITY & EQUITY RELATED':
                active = True
                continue
            if not active:
                continue
            if code == 'Total':
                subtotal = float(row['H'])
                break
            if not code.startswith('IN'):
                continue
            if not isin_valid(code):
                raise ValueError(f'Invalid ISIN at {filename}:{row_number}: {code}')
            if row.get('H', '').strip() == '@':
                unquantified.append(dict(isin=code, sourceSecurityName=row['D'].strip(), sourceRow=row_number,
                                         reportedWeight='@', meaning='Less than 0.01% to NAV; exact weight not published'))
                continue
            weight = float(row['H'])
            if not 0 <= weight <= 100:
                raise ValueError('Out-of-range portfolio weight')
            key = (scheme, code)
            if key in seen:
                raise ValueError(f'Duplicate equity ISIN: {key}')
            seen.add(key)
            raw_name = row['D'].strip()
            name = re.sub(r'[£#@*]+$', '', raw_name).strip()
            security_id = 'ISIN:' + code
            holding = dict(amc='HDFC Mutual Fund', scheme=scheme, category=category,
                           month=args.month, securityId=security_id,
                           slug=slug(name) + '-' + code.lower(), isin=code, stock=name,
                           sourceSecurityName=raw_name, canonicalSecurityName=None,
                           nameResolutionStatus='SOURCE', sector=row.get('E', '').strip() or None,
                           weight=weight, quality='ISIN_VALIDATED', sourceFile=filename,
                           sourceRow=row_number)
            extracted.append(holding)
        if subtotal is None or not extracted:
            raise ValueError(f'Equity total or holdings missing: {filename}')
        total = sum(x['weight'] for x in extracted)
        if abs(total - subtotal) > 0.1 + len(unquantified) * 0.01:
            raise ValueError(f'Equity reconciliation failed: {filename}: rows {total}, source {subtotal}')
        holdings.extend(extracted)
        audits.append(dict(scheme=scheme, category=category, sourceFile=filename,
                           sourceUrl=source['url'], sha256=source['sha256'], sheet='first worksheet',
                           equityRows=len(extracted), sourceEquityPercent=subtotal,
                           extractedEquityPercent=round(total, 8), unquantifiedPositions=unquantified))
    if len(audits) != 6 or len({x['scheme'] for x in audits}) != 6:
        raise ValueError('All six intended core scheme disclosures are required')
    holdings.sort(key=lambda h: (h['scheme'], -h['weight'], h['stock']))
    index = json.loads((target / 'index.json').read_text())
    old_rows = [h for m in index['months'] for h in json.loads((target / 'by-month' / (m + '.json')).read_text())['holdings']]
    all_rows = old_rows + holdings
    now = datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')
    next_month = datetime.date(expected.year + expected.month // 12, expected.month % 12 + 1, 1)
    as_of = (datetime.datetime.combine(next_month, datetime.time.min, datetime.timezone.utc) - datetime.timedelta(seconds=1)).isoformat().replace('+00:00', 'Z')
    source_hash = hashlib.sha256(json.dumps(audits, sort_keys=True).encode()).hexdigest()
    metadata = dict(index['metadata'], source='HDFC Mutual Fund official monthly XLSX disclosures; historical repository snapshots retained',
                    sourceFile='official-sources-' + args.month + '.json', asOf=as_of, generatedAt=now,
                    quality='PARTIAL', availability='partial', coverageEnd=args.month,
                    recordCount=len(all_rows), holdingCount=len(all_rows), schemeCount=6,
                    sourceSha256=source_hash, validationStatus='PASSED_WITH_WARNINGS')
    snapshot_meta = dict(metadata, recordCount=len(holdings), holdingCount=len(holdings),
                         coverageStart=args.month, quality='PARTIAL', availability='partial', validationStatus='PASSED_WITH_WARNINGS')
    write(destination, dict(schemaVersion='mf-v2', month=args.month, metadata=snapshot_meta,
                            schemes=sorted({h['scheme'] for h in holdings}), holdings=holdings))
    write(target / ('official-sources-' + args.month + '.json'), dict(month=args.month, checkedAt=now,
          scope='Indian equity positions with numeric published weights in six core HDFC schemes. Positions marked @ (less than 0.01%) remain in this source manifest and are excluded from quantitative analysis. Cash, debt, derivatives and non-equity instruments excluded.',
          reconciliationTolerancePercentagePoints=0.1, sources=audits))
    index['months'] = sorted(index['months'] + [args.month])
    index['latestMonth'] = args.month
    # Preserve missing months explicitly; never treat the preceding available file as a one-month comparison.
    first = datetime.date.fromisoformat(index['firstMonth'] + '-01')
    expected_months = []
    while first <= expected:
        expected_months.append(first.strftime('%Y-%m'))
        first = datetime.date(first.year + first.month // 12, first.month % 12 + 1, 1)
    index['expectedMonths'] = expected_months
    index['metadata'] = metadata
    index['schemes'] = [dict(scheme=n, category=c, slug=slug(n)) for _, n, c in SCHEMES]
    index['presentCoreSchemes'] = [n for _, n, _ in SCHEMES]
    index['missingCoreSchemes'] = []
    index['counts'].update(holdings=len(all_rows), stocks=len({h['securityId'] for h in all_rows}), schemes=6)
    valid = sum(isin_valid(h.get('isin') or '') for h in all_rows)
    index['trustMetadata'].update(isinDataAvailable=True, eligibleIsinCount=len(all_rows), validIsinCount=valid,
          isinCoveragePercent=round(valid / len(all_rows) * 100, 1), generatedAt=now, asOf=as_of,
          source=metadata['source'], quality='PARTIAL')
    index['latestImport'] = dict(month=args.month, holdings=len(holdings), schemes=6, isinCoveragePercent=100,
                                missingMonths=[m for m in expected_months if m not in index['months']])
    write(target / 'index.json', index)
    by_security = collections.defaultdict(list)
    for h in holdings:
        by_security[h['securityId']].append(h)
    consensus, matrix = [], []
    security_index = json.loads((target / 'securities/index.json').read_text())
    for identity, held in by_security.items():
        first = held[0]
        weights = {h['scheme']: h['weight'] for h in held}
        average = sum(weights.values()) / 6
        score = len(weights) / 6 * 70 + min(average / 3, 1) * 30
        summary = dict(securityId=identity, slug=first['slug'], stock=first['stock'], sector=first['sector'],
                       schemeCount=len(weights), normalizedWeight=average, score=score, weights=weights)
        consensus.append(summary)
        matrix.append(summary)
        # ISIN IDs deliberately do not merge unverified legacy NAME identities.
        detail = dict(securityId=identity, slug=first['slug'], isin=first['isin'], stock=first['stock'], sector=first['sector'],
                      firstTracked=args.month, latestTracked=args.month, monthsTracked=1, maxSchemeCount=len(weights),
                      peakNormalizedWeight=average, latestSchemeWeights=[dict(scheme=h['scheme'], weight=h['weight'], quality=h['quality']) for h in held],
                      monthlyHistory=[dict(month=args.month, schemeCount=len(weights), totalWeight=sum(weights.values()), normalizedWeight=average, avgHeldWeight=sum(weights.values()) / len(weights))],
                      schemeHistory=[dict(scheme=h['scheme'], history=[dict(month=args.month, weight=h['weight'], quality=h['quality'])]) for h in held],
                      sources=[dict(month=args.month, pdfs=sorted({h['sourceFile'] for h in held}))])
        write(target / 'securities' / (first['slug'] + '.json'), detail)
        security_index['securities'].append(dict(securityId=identity, slug=first['slug'], isin=first['isin'], stock=first['stock'], sector=first['sector'], latestTracked=args.month))
    write(target / 'securities/index.json', security_index)
    consensus.sort(key=lambda x: (-x['score'], -x['normalizedWeight'], x['stock']))
    write(target / 'latest.json', dict(schemaVersion='mf-v2', latestMonth=args.month, previousMonth=None,
          metadata=metadata, summary=dict(holdings=len(holdings), schemes=6), topConsensus=consensus[:60],
          signals={}, sectorRotation=[], ownershipMatrix=sorted(matrix, key=lambda x: -x['score'])[:60],
          comparisonNote='The preceding calendar month is unavailable. No monthly accumulation, reduction or exit signals are inferred. Legacy NAME identities are not joined to new ISIN identities.'))
    print(json.dumps(dict(month=args.month, equityRows=len(holdings), securities=len(by_security), schemes=6, reconciliation=audits), indent=2))


if __name__ == '__main__':
    main()
