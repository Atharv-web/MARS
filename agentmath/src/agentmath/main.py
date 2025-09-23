import warnings,re, os
from datetime import datetime
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from crew import Agentmath

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

app = FastAPI()

origins = {
    "http://localhost:3000",
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials = True,
    allow_headers = ["*"],
    allow_methods = ["*"],
)

class UserRequest(BaseModel):
    input: str

@app.post("/chat")
async def run(req:UserRequest):
    user_topic = req.input
    inputs = {'topic': user_topic,}
            
    try:
        result = await Agentmath().crew().kickoff_async(inputs=inputs)
        return {"result": result}
    except Exception as e:
        raise Exception(f"An error occurred while running the crew: {e}")

@app.post("/human-input")
async def handle_human_input(response: dict):
    return {"status": "received"}