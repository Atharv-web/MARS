# MARS: Medical Assistant for Research Synthesis

MARS (Medical Assistant for Research Synthesis) is an AI-powered assistant that helps you **research topics in medicine** and **document them in structured, comprehensive reports**. 
It automates the entire process from developing research strategies to critical appraisal, synthesis, and professional report generation making it ideal for medical researchers, clinicians, students, and anyone seeking evidence-based insights in medicine.

This is a python/next js application. Backend is python, Frontend is Nextjs. The backend uses crewai framework to assist researchers to search and document research topics. Frontend is a simple nextjs application with simple, cool features with firebase integration for authentication.

---

## Features

- **Automated Research Strategy**: Identifies the best databases (e.g., PubMed, MEDLINE) and search strategies for any medical topic.
- **Literature Search & Curation**: Conducts systematic searches, applies inclusion/exclusion criteria, and curates the most relevant articles.
- **Critical Appraisal**: Evaluates study design, methodology, bias, and evidence quality for top research articles.
- **Synthesis & Trend Identification**: Summarizes key findings, trends, controversies, and knowledge gaps in the field.
- **Executive Summary**: Produces concise summaries suitable for non-specialist audiences.
- **Detailed Report Generation**: Creates structured reports with introduction, methodology, results, discussion, and conclusions.
- **Professional Formatting**: Outputs clean, error-free Markdown (or PDF) reports with title pages, tables of contents, and references.

---

## Example Workflow

1. **Define a Topic**: Specify the medical topic you want to research (e.g., "Post-operative issues and patient care").
2. **MARS Agents in Action**:
    - Develop a research strategy tailored to your topic.
    - Search and curate the latest and most relevant literature.
    - Critically appraise and synthesize the findings.
3. **Receive Outputs**: Get a well-formatted, referenced document with all findings, trends etc.

---

## Getting Started

### Installation - frontend and backend

```bash
git clone https://github.com/Atharv-web/MARS.git
cd MARS
cd med-researcher
npm install
```

```bash
cd MARS
cd researcher
pip install -r requirements.txt
```

### Usage

1. **Configure Backend**: run the python based backend

```bash
cd researcher/scr/researcher
uvicorn main:app --reload
```

2. **Run frontend Script**:

```bash
cd med-researcher
npm run dev
```

3. **Provide Topic Input**: Provide your input.

4. **Review Outputs**: Find research report in the `researcher/src/results/` directory.

---

## Example Output

Reports include:
- Title page & table of contents
- Executive summary
- Introduction, methodology, results, discussion, and conclusion
- Key trends, gaps, and controversies
- References in standard citation style

---