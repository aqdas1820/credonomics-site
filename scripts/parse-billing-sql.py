"""PostgreSQL 17 grammar checks only; no database execution or role validation.

Install isolated tooling: python -m pip install --only-binary=:all: --target artifacts/pgparser pglast==7.20
Set PYTHONPATH to artifacts/pgparser before invoking this file.
"""
import json
from pathlib import Path
from pglast import parser

root = Path(__file__).resolve().parents[1]
statement_count = function_count = 0
for path in sorted((root / "docs/billing").glob("01[2-6]*.sql")):
    source = path.read_text(encoding="utf-8")
    statements = len(json.loads(parser.parse_sql_json(source))["stmts"])
    functions = len(json.loads(parser.parse_plpgsql_json(source)))
    statement_count += statements
    function_count += functions
    print(f"PASS {path.name}: {statements} SQL statements; {functions} PL/pgSQL functions")
print(f"PASS PostgreSQL {parser.get_postgresql_version()}: {statement_count} statements; {function_count} functions")
print("Database runtime, dependencies, RLS and concurrency NOT EXECUTED by this parser")
