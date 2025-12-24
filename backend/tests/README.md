# FEAS Tests

This directory contains tests for the Forensic Evidence Acquisition System.

## Test Files

- `test_pdf_generation.py` - Tests for PDF report generation functionality

## Running Tests

### With pytest

```bash
cd backend
pip install pytest
python -m pytest tests/ -v
```

### Direct execution

```bash
cd backend
python tests/test_pdf_generation.py
```

## Test Coverage

The tests verify:

1. **PDF Generation**
   - Forensic report generation with sample data
   - Report structure and content
   - File creation and size validation

2. **Verification Reports**
   - Hash verification report generation
   - Pass/fail status display

## Adding New Tests

Create new test files following the naming convention `test_*.py` and use pytest assertions:

```python
def test_my_feature():
    result = my_function()
    assert result == expected_value, "Description of failure"
```
