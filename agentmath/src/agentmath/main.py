#!/usr/bin/env python
import warnings, uuid
from datetime import datetime
from pydantic import BaseModel
from fastapi import FastAPI,HTTPException
from starlette.middleware.cors import CORSMiddleware
from typing import List, Dict
from dotenv import load_dotenv
load_dotenv()

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

app= FastAPI()

origins={
    "http://localhost:3000",
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)

class UserRequest(BaseModel):
    input: str

class FeedbackRequest(BaseModel):
    session_id: str
    feedback: str

@app.post("/chat")
async def chat(req:UserRequest):
    """
    Run the crew - backend.
    """
    session_id = str(uuid.uuid4())
    inputs = {
        'topic': req.input,
        'current_year': str(datetime.now().year)
    }
    session_id = start_session(inputs)
    return {"status": "started", "session_id":session_id}

@app.get('/session/{session_id}')
async def session_Status(session_id: str):
    session_data = get_session(session_id)
    if not session_data:
        raise HTTPException(status_code=404,detail="Session not found...error")
    return session_data

@app.post("/feedback")
async def feedback_mech(req: FeedbackRequest):
    "Logic for getting the feedback from the backend"
    ok=send_feedback(req.session_id,req.feedback)
    if not ok:
        raise HTTPException(status_code=400, detail="session missing or not waiting...hence failed to send feedback.")
    return {"status": "queued"}