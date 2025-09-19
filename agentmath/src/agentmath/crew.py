from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from typing import List
from crewai_tools import RagTool
from mcp import StdioServerParameters
import os,sys
from dotenv import load_dotenv
load_dotenv()
from human_callback import custom_human_callback

rag_tool = RagTool()
rag_tool.add(r'C:\Users\Atharva\Desktop\MARS\agentmath\src\agentmath\MathData\mathbook.pdf', data_type="pdf_file")

@CrewBase
class Agentmath():
    """Agentmath crew"""

    agents: List[BaseAgent]
    tasks: List[Task]

    mcp_server_params = [StdioServerParameters(
        command=sys.executable,
        args=["tavily_mcp_server.py"],
        env={"TAVILY_API_KEY": os.getenv('TAVILY_API_KEY'), **os.environ}
    )]

    @agent
    def research_agent(self) -> Agent:
        mcp_tool= self.get_mcp_tools()
        all_tools= [rag_tool] + mcp_tool
        return Agent(
            config=self.agents_config['research_agent'],
            tools = all_tools,
            verbose=True
        )

    @agent
    def math_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['math_agent'],
            verbose=True
        )

    @task
    def research_task(self) -> Task:
        return Task(
            config=self.tasks_config['research_task'],
        )

    @task
    def math_task(self) -> Task:
        return Task(
            config=self.tasks_config['math_task'],
            callback=custom_human_callback
        )

    @crew
    def crew(self) -> Crew:
        """Creates the Agentmath crew"""

        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )