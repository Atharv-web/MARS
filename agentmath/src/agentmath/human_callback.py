import uuid, time
from typing import Optional
from crewai import TaskOutput
from db import save_feedback_request, wait_for_feedback_response, save_agent_response

def custom_human_callback(output: TaskOutput)-> str:
    """
    Custom human callback for feedback to the crew.
    - Saves the request into DB
    - Waits until frontend provides feedback via /feedback API
    - Returns the feedback string back into CrewAI flow
    """
    # Generate a session_id for tracking (can also be passed in externally if you want session continuity)
    session_id = output.metadata.get("session_id")
    prompt = output.description
    agent_response = output.raw_output or ""
    # Save request into DB (prompt + agent's partial response)
    fb_id = save_feedback_request(session_id=session_id, prompt=prompt, agent_response=agent_response)
    save_agent_response(fb_id=fb_id,agent_response=agent_response)

    print(f"[HumanCallback] Waiting for feedback on req_id={fb_id}, session_id={session_id}")

    # Block until frontend responds (via /feedback)
    feedback = wait_for_feedback_response(fb_id)

    print(f"[HumanCallback] Got feedback for fb_id={fb_id}: {feedback}")
    return feedback