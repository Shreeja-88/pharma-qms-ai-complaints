from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json
from database import engine, Base, get_db, Complaint
from agent import execute_qms_agent
from sqlalchemy.orm import Session

app = FastAPI(title="Pharma QMS AI Complaints API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    action_type: Optional[str] = "log"  # "log", "edit"
    current_data: Optional[Dict[str, Any]] = {}

@app.post("/api/chat")
def process_chat(req: ChatRequest):
    """Processes natural language requests to log or edit complaints."""
    try:
        result = execute_qms_agent(
            user_input=req.message,
            action_type=req.action_type,
            current_data=req.current_data
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/extract-document")
async def extract_document(file: UploadFile = File(...)):
    """Extracts complaint info from uploaded PDF or text documents."""
    try:
        content = await file.read()
        text_content = content.decode("utf-8", errors="ignore")
        
        result = execute_qms_agent(
            user_input=text_content,
            action_type="document"
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/save-complaint")
def save_complaint(data: Dict[str, Any], db: Session = Depends(get_db)):
    """Saves the AI-populated complaint to the database."""
    complaint = Complaint(**data)
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return {"status": "success", "complaint_id": complaint.id}