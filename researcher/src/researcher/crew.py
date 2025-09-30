from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task, after_kickoff
from crewai.agents.agent_builder.base_agent import BaseAgent
from typing import List
from crewai_tools import SerperDevTool, FileWriterTool
import os

search_tool = SerperDevTool()
file_writer_tool = FileWriterTool()

root_folder = os.path.dirname(os.path.abspath(__file__))

@CrewBase
class Mars():
    """Mars crew"""

    agents: List[BaseAgent]
    tasks: List[Task]

    @agent
    def researcher(self) -> Agent:
        return Agent(
            config=self.agents_config['researcher'],
            tools = [search_tool],
            verbose=True,
        )

    @agent
    def reporting_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config['reporting_analyst'],
            tools=[file_writer_tool],
            verbose=True,
        )

    # TASKS
    @task
    def comprehensive_research_task(self) -> Task:
        return Task(
            config=self.tasks_config['comprehensive_research_task'],
        )

    @task
    def synthesis_and_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config['synthesis_and_analysis_task'],
        )
    
    @task
    def final_report_creation_task(self) -> Task:
        return Task(
            config=self.tasks_config['final_report_creation_task'],
            output_file="results/{safe_topic}_{timestamp}.md"
        )
    
    @after_kickoff
    @staticmethod
    def format_folder(self,output):
        "Modify and delete the .md folders being created in the directory"
        files_deleted_count = 0
        try:
            for file_name in os.listdir(root_folder):
                full_path = os.path.join(root_folder,file_name)
                if os.path.isfile(full_path) and file_name.lower().endswith('.md'):
                    try:
                        os.remove(full_path)
                        files_deleted_count+=1
                    except OSError as e:
                        print(f"Error occured in deleting {file_name}: {e}")
        except FileNotFoundError as e:
            return {f"Error occured: {e}"}
        if files_deleted_count == 0:
            print(f"No .md files present here!!")
        else:
            print(f"\n Finished deleting {files_deleted_count} files")

    @crew
    def crew(self) -> Crew:
        """Creates the Mars crew"""

        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )