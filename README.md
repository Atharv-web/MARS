# MARS: Medical Assistant for Research Synthesis

MARS (Medical Assistant for Research Synthesis) is an AI-powered assistant that helps you **research topics in medicine** and **document them in structured, comprehensive reports**. 
It automates the entire process—from developing research strategies to critical appraisal, synthesis, and professional report generation—making it ideal for medical researchers, clinicians, students, and anyone seeking evidence-based insights in medicine.

---

## Features

- **Automated Research Strategy**: Identifies the best databases (e.g., PubMed, MEDLINE) and search strategies for any medical topic.
- **Literature Search & Curation**: Conducts systematic searches, applies inclusion/exclusion criteria, and curates the most relevant articles.
- **Critical Appraisal**: Evaluates study design, methodology, bias, and evidence quality for top research articles.
- **Synthesis & Trend Identification**: Summarizes key findings, trends, controversies, and knowledge gaps in the field.
- **Executive Summary**: Produces concise summaries suitable for non-specialist audiences.
- **Detailed Report Generation**: Creates structured reports with introduction, methodology, results, discussion, and conclusions.
- **Data Visualization**: Generates charts, graphs, and infographics for clear communication of findings.
- **Professional Formatting**: Outputs clean, error-free Markdown (or PDF) reports with title pages, tables of contents, and references.

---

## Example Workflow

1. **Define a Topic**: Specify the medical topic you want to research (e.g., "Post-operative issues and patient care").
2. **MARS Agents in Action**:
    - Develop a research strategy tailored to your topic.
    - Search and curate the latest and most relevant literature.
    - Critically appraise and synthesize the findings.
    - Generate visualizations, executive summaries, and full reports.
3. **Receive Outputs**: Get a well-formatted, referenced document with all findings, trends, and visualizations.

---

## Getting Started

### Prerequisites

- Python 3.8+
- [CrewAI](https://docs.crewai.com/)
- Other dependencies as specified in `requirements.txt`
- API keys for search tools (e.g., SerperDev) and `.env` file if using web tools

### Installation

```bash
git clone https://github.com/Atharv-web/MARS.git
cd MARS
pip install -r requirements.txt
```

### Usage

1. **Configure Agents and Tasks**: Edit `mars/agents-tasks.txt` to define the sequence of research and reporting tasks.
2. **Run the Main Script**:

```bash
python mars/src/mars/main.py
```

3. **Provide Topic Input**: Replace or supply the desired medical topic when prompted or configure input in the script.

4. **Review Outputs**: Find generated reports and visualizations in the `mars/results/` directory.

---

## Example Output

Reports include:
- Title page & table of contents
- Executive summary
- Introduction, methodology, results, discussion, and conclusion
- Key trends, gaps, and controversies
- Data visualizations
- References in standard citation style

---
