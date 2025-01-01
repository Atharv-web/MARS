# AI Agents for Medical Research and Reporting

This project leverages the `crew.ai` framework to create AI-driven agents that perform medical research and generate detailed reports based on user-provided symptoms. The system is modular, allowing the addition of custom tools and agents as needed.

---

## **Features**
1. **Researcher Agent**  
   Conducts thorough research about the provided topic (symptoms) and gathers relevant information, including:
   - Disease name
   - Possible causes
   - Medications
   - Prevention techniques

2. **Reporting Analyst Agent**  
   Processes research findings into a comprehensive medical report formatted in Markdown.

3. **Custom Tools**  
   - **CSV Search Tool**: Enables searching through a pre-defined medical dataset.
   - **File Writer Tool**: (Optional) Saves results in various formats.

---

## **Setup Instructions**

### **Prerequisites**
- Python 3.8 or above
- Virtual environment (recommended)
- Required Python libraries:
  - `crewai`
  - `crewai_tools`
  - `dotenv`
  - `ollama` for embedding and LLM tasks

---

### **Installation**

1. Clone this repository:
   ```bash
   git clone https://github.com/Atharv-web/ai_agents_rec.git
   cd ai_agents_rec
   ```

2. Set up a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate # On Windows, use `venv\Scripts\activate`
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:  
   Create a `.env` file to store sensitive credentials like API keys.

---

### **Usage**

1. **Run the application**:
   ```bash
   python main.py
   ```

2. **Input symptoms**:
   Enter symptoms in the prompt to initiate research and report generation. For example:
   ```
   Enter your symptoms here: fever and headache
   ```

3. **View generated output**:
   The output will include research findings and a full-fledged medical report.

4. **Exit the program**:
   Type `exit` in the input prompt to stop the application.

---

## **Configuration**

### **Agents Configuration (`agents.yaml`)**
- `researcher`: Performs medical research based on user input.
- `reporting_analyst`: Converts research findings into detailed Markdown reports.

### **Tasks Configuration (`tasks.yaml`)**
- `research_task`: Defines the research process and expected output.
- `reporting_task`: Specifies the task for report generation.

### **Tool Configuration**
Tools like `CSVSearchTool` can be customized in the `crew.py` file. I used OLLAMA model as its an open-source model
```python
tool1 = CSVSearchTool(
    csv="path_to_your_csv",
    config=dict(
        llm=dict(
            provider="ollama",
            config=dict(
                model="llama3.2:3b-instruct-fp16",
                temperature=0.1
            ),
        ),
        embedder=dict(
            provider="ollama",
            config=dict(
                model="nomic-embed-text",
            ),
        ),
    )
)
```

---

## **File Overview**

1. **`main.py`**  
   Entry point for the application. Runs the crew with user inputs for symptoms.

2. **`crew.py`**  
   Defines the crew, agents, tools, and tasks. Includes configurations for `CSVSearchTool` and agent behaviors.

3. **`agents.yaml`**  
   Configuration file for agents with roles, goals, and backstories.

4. **`tasks.yaml`**  
   Configuration file for tasks with descriptions, expected outputs, and assigned agents.

---

## **Future Enhancements**
- Add more tools for advanced data analysis.
- Include support for additional LLM providers.
- Integrate a web interface for better user interaction.
