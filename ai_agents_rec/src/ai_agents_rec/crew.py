from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import CSVSearchTool,FileWriterTool
from dotenv import load_dotenv
load_dotenv()

csv_dataset_path = "C:/Users/Atharva/Desktop/GitHubProjects/csv dataset/Clean_data.csv"
tool1 = CSVSearchTool(
	csv=csv_dataset_path,
	config=dict(
        llm=dict(
            provider="ollama",
            config=dict(
                model="llama3.2:3b-instruct-fp16",
                temperature=0.1
                # top_p=1,
                # stream=true,
            ),
        ),
        embedder=dict(
            provider="ollama",
            config=dict(
                model="nomic-embed-text",
                # task_type="retrieval_document",
                # title="Embeddings",
            ),
        ),
    )
)

@CrewBase
class AiAgentsRec():
	"""AiAgentsRec crew"""

	agents_config = 'config/agents.yaml'
	tasks_config = 'config/tasks.yaml'

	@agent
	def researcher(self) -> Agent:
		return Agent(
			config=self.agents_config['researcher'],
			tools=[tool1],
			verbose=True
		)

	@agent
	def reporting_analyst(self) -> Agent:
		return Agent(
			config=self.agents_config['reporting_analyst'],
			tools= [],
			verbose=True
		)

	# @agent
	# def file_writer(self) -> Agent:
	# 	return Agent(
	# 		config= self.agents_config['file_writer'],
	# 		tools= [FileWriterTool()],
	# 		verbose=True
	# 	)

	@task
	def research_task(self) -> Task:
		return Task(
			config=self.tasks_config['research_task'],
		)

	@task
	def reporting_task(self) -> Task:
		return Task(
			config=self.tasks_config['reporting_task'],
			output_file= 'report.md'
		)
	
	# @task
	# def file_writing_task(self) -> Task:
	# 	return Task(
	# 		config=self.tasks_config['file_writing_task'],
	# 	)

	# Crew
	@crew
	def crew(self) -> Crew:
		"""Creates the AiAgentsRec crew"""

		return Crew(
			agents=self.agents,
			tasks=self.tasks,
			process=Process.sequential,
			verbose=True,
		)

 