from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task, after_kickoff
from crewai.agents.agent_builder.base_agent import BaseAgent
from typing import List
from crewai_tools import SerperDevTool, FileWriterTool
import os
from dotenv import load_dotenv
load_dotenv()

# If you want to run a snippet of code before or after the crew starts,
# you can use the @before_kickoff and @after_kickoff decorators
# https://docs.crewai.com/concepts/crews#example-crew-class-with-decorators

search_tool = SerperDevTool()
file_writer_tool = FileWriterTool()

@CrewBase
class Mars():
    """Mars crew"""

    agents: List[BaseAgent]
    tasks: List[Task]

    # Learn more about YAML configuration files here:
    # Agents: https://docs.crewai.com/concepts/agents#yaml-configuration-recommended
    # Tasks: https://docs.crewai.com/concepts/tasks#yaml-configuration-recommended
    
    # If you would like to add tools to your agents, you can learn more about it here:
    # https://docs.crewai.com/concepts/agents#agent-tools
    @agent
    def researcher(self) -> Agent:
        return Agent(
            config=self.agents_config['researcher'], # type: ignore[index]
            tools = [search_tool],
            verbose=True,
        )

    @agent
    def reporting_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config['reporting_analyst'], # type: ignore[index]
            tools=[file_writer_tool],
            verbose=True,
        )

    # To learn more about structured task outputs,
    # task dependencies, and task callbacks, check out the documentation:
    # https://docs.crewai.com/concepts/tasks#overview-of-a-task
    # TASKS
    @task
    def comprehensive_research_task(self) -> Task:
        return Task(
            config=self.tasks_config['comprehensive_research_task'], # type: ignore[index]
        )

    @task
    def synthesis_and_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config['synthesis_and_analysis_task'], # type: ignore[index]
        )
    
    @task
    def final_report_creation_task(self) -> Task:
        return Task(
            config=self.tasks_config['final_report_creation_task'], # type: ignore[index]
            output_file="results/{timestamp}_{safe_topic}.md"
        )
    
    @after_kickoff
    @staticmethod
    def format_folder(self,output):
        "Modify and delete the .md folders being created in the directory"
        root_folder = r"C:\Users\Atharva\Desktop\MARS\mars"
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
        except FileNotFoundError:
            print(f"Directory named: {root_folder} not found")
            return
        if files_deleted_count == 0:
            print(f"No .md files present here Sire!!")
        else:
            print(f"\n Finished deleting {files_deleted_count} files")

    @crew
    def crew(self) -> Crew:
        """Creates the Mars crew"""
        # To learn how to add knowledge sources to your crew, check out the documentation:
        # https://docs.crewai.com/concepts/knowledge#what-is-knowledge

        return Crew(
            agents=self.agents, # Automatically created by the @agent decorator
            tasks=self.tasks, # Automatically created by the @task decorator
            process=Process.sequential,
            verbose=True,
            # process=Process.hierarchical, # In case you wanna use that instead https://docs.crewai.com/how-to/Hierarchical/
        )