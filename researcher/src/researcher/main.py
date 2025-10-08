import warnings
import re, os
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from src.researcher.crew import Mars
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://mars-flax.vercel.app"],
    allow_credentials = True,
    allow_headers = ["*"],
    allow_methods = ["*"],
)

class UserRequest(BaseModel):
    input: str

@app.get("/")
async def health_check():
    return {"status":"backend is running..."}

@app.post("/research")
async def run_research(request: UserRequest):
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
        await Mars().crew().kickoff_async(inputs=inputs)
        return {"message":"Research Task Completed!","output_file":f"results/{inputs['safe_topic']}_{inputs['timestamp']}.md"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while running the crew: {str(e)}")

@app.get("/report/{file_path:path}")
async def get_report(file_path:str):
    """Serve the generated report file"""
    try:
        if not file_path.startswith("results/"):
            raise HTTPException(status_code=403,detail= "Access denied")

        full_path = os.path.join(os.path.dirname(__file__),file_path)

        if not os.path.exists(full_path):
            raise HTTPException(status_code=404, detail="Report not found")
        
        return FileResponse(path=full_path,media_type="text/markdown", filename=os.path.basename(file_path))
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))