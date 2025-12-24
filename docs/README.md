# FEAS Documentation

This directory contains comprehensive documentation for the Forensic Evidence Acquisition System (FEAS).

## Files

- **FEAS_Technical_Documentation.tex** - Complete LaTeX source for the technical documentation

## Compiling the LaTeX Documentation

### Prerequisites

You need a LaTeX distribution installed:

**Ubuntu/Debian:**
```bash
sudo apt-get install texlive-full
```

**macOS (with MacTeX):**
```bash
brew install --cask mactex
```

**Windows:**
Download and install MiKTeX from https://miktex.org/download

### Compiling

Compile the documentation using pdflatex:

```bash
cd docs
pdflatex FEAS_Technical_Documentation.tex
pdflatex FEAS_Technical_Documentation.tex  # Run twice for TOC and references
```

Or use latexmk for automatic compilation:

```bash
latexmk -pdf FEAS_Technical_Documentation.tex
```

### Online Compilation

You can also use Overleaf (https://www.overleaf.com) to compile the LaTeX document:

1. Create a new project on Overleaf
2. Upload `FEAS_Technical_Documentation.tex`
3. Click "Recompile" to generate the PDF

## Document Contents

The technical documentation includes:

1. **Introduction** - Project overview, key features, team members
2. **System Architecture** - Component diagrams, project structure
3. **Installation and Configuration** - Complete setup guide
4. **URL Acquisition Workflow** - Social media evidence collection
5. **File Upload Processing** - Local file evidence handling
6. **PDF Report Generation** - Forensic report details
7. **Chain of Custody** - Audit logging system
8. **API Reference** - Complete endpoint documentation
9. **Security Considerations** - Best practices
10. **Troubleshooting** - Common issues and solutions
11. **Appendix** - Configuration templates, tech stack

## Team Members

- Rana Uzair Ahmad - Lead Developer
- Muhammad Usman - Backend Developer
- Umae Habiba - Frontend Developer
- Hoor ul Ain - QA & Documentation
- Bilal Badar - DevOps & Integration

## License

This documentation is part of the FEAS project and is licensed under the MIT License.
