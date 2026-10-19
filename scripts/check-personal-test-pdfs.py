"""Independently inspect ONLY fixed synthetic PDF fixtures; no dump/customer inputs."""
from pathlib import Path
from pypdf import PdfReader

for name in ('standard', 'boundary'):
    pdf = PdfReader(Path('artifacts/phase26-pdf') / f'{name}-TEST.pdf')
    assert 'TEST invoice' in pdf.metadata.title
    assert 'No real invoice' in pdf.metadata.subject
    text = '\n'.join(page.extract_text() for page in pdf.pages)
    for index, page in enumerate(pdf.pages):
        value = page.extract_text()
        for required in ('TEST', 'TEST COPY', 'CredoNomics', 'NOT VALID FOR PAYMENT', 'No paid receipt has been issued.', f'Page {index+1} of {len(pdf.pages)}'):
            assert required in value, (name, index, required)
        assert tuple(page.mediabox)[2:] == (595, 842)
        assert not page.get('/Annots'), 'No active link/checkout annotations'
        assert page['/Resources'].get('/XObject'), 'Embedded brand image missing'
    if name == 'standard':
        assert len(pdf.pages) == 1
        for required in ('Synthetic strategy session', '2,469.00', '250.00', 'INR 2,719.00', 'SIM. SUCCESS'):
            assert required in text, required
    else:
        assert len(pdf.pages) > 1
        for i in range(1, 21):
            assert f'Boundary item {i}:' in text, f'Missing item {i}'
        assert '2147483647' in text and 'INR 10,00,00,000.00' in text
        # Every character of a 120-character wide customer must survive wrapping.
        customer = text.split('TEST CUSTOMER\n', 1)[1].split('DOCUMENT DATE', 1)[0]
        assert customer.replace('\n', '').replace(' ', '') == 'W' * 120
    print(f'PASS independent {name} TEST PDF: {len(pdf.pages)} A4 page(s), brand, TEST safety, complete items and INR totals')
