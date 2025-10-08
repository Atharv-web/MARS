import warnings
import re
from datetime import datetime
from fastapi import FastAPI
from src.researcher.crew import Mars
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://mars-flax.vercel.app/"],
    allow_credentials = True,
    allow_headers = ["*"],
    allow_methods = ["*"],
)

class UserRequest(BaseModel):
    input: str

@app.post("/research")
def run_research(request: UserRequest):
    """Run the crew."""

    user_topic = request.input.strip()
    if user_topic.lower() in ["exit","end","exit/bye","end/bye"]:
        return {"message": "Buh-Bye"}
            
    inputs = {
        'topic': user_topic,
        'current_year': str(datetime.now().year),
        'timestamp': datetime.now().strftime("%d-%m-%Y_%H-%M-%S"),
        'safe_topic': re.sub(r'[^\w_]', '', user_topic.replace(' ', '_'))
        }
            
    try:
        Mars().crew().kickoff(inputs=inputs)
        return {"message":"Research Task Completed!"}
    except Exception as e:
        raise Exception(f"An error occurred while running the crew: {e}")