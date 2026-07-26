import os
import json
from typing import TypedDict, Optional, Dict, Any
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq LLM with gemma2-9b-it as requested
llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.3-70b-versatile",  # <-- ACTIVE & FAST
    temperature=0.1,
)

# ------------------------------------------------------------------
# Define Agent State
# ------------------------------------------------------------------
class ComplaintState(TypedDict):
    user_input: str
    action_type: str  # 'log', 'edit', 'document'
    current_data: Optional[Dict[str, Any]]
    updated_data: Optional[Dict[str, Any]]
    ai_response: str

# ------------------------------------------------------------------
# Tool 1: Log Complaint Tool
# ------------------------------------------------------------------
@tool
def log_complaint_tool(prompt: str) -> dict:
    """Extracts new complaint fields from natural language user input."""
    system_prompt = """
    You are an AI QMS Assistant for a Pharmaceutical Manufacturer.
    Extract complaint details from the prompt and return strictly JSON:
    {
        "customer_name": "string or null",
        "product_name": "string or null",
        "product_strength": "string or null",
        "batch_number": "string or null",
        "affected_quantity": "string or null",
        "manufacturing_date": "YYYY-MM-DD or null",
        "expiry_date": "YYYY-MM-DD or null",
        "defect_description": "string or null"
    }
    """
    messages = [SystemMessage(content=system_prompt), HumanMessage(content=prompt)]
    res = llm.invoke(messages)
    cleaned = res.content.strip().strip("```json").strip("```")
    return json.loads(cleaned)

# ------------------------------------------------------------------
# Tool 2: Edit Complaint Tool
# ------------------------------------------------------------------
@tool
def edit_complaint_tool(prompt: str, current_data: dict) -> dict:
    """Updates specific fields of an existing complaint while retaining original values."""
    system_prompt = f"""
    You are updating an existing complaint. 
    Current Form Data: {json.dumps(current_data)}
    
    Apply changes requested in the user prompt to the current data. Preserve all unmentioned fields.
    Return strictly JSON matching the full complaint dictionary structure.
    """
    messages = [SystemMessage(content=system_prompt), HumanMessage(content=prompt)]
    res = llm.invoke(messages)
    cleaned = res.content.strip().strip("```json").strip("```")
    return json.loads(cleaned)

# ------------------------------------------------------------------
# Tool 3: Document Extraction Tool
# ------------------------------------------------------------------
@tool
def extract_document_tool(document_text: str) -> dict:
    """Parses text from pharma PDFs/Emails to populate form fields."""
    system_prompt = """
    Extract technical pharma complaint information from document text. 
    Pay attention to API/FDF details, batch numbers, and specifications.
    Return strictly JSON:
    {
        "customer_name": "string or null",
        "product_name": "string or null",
        "product_strength": "string or null",
        "batch_number": "string or null",
        "affected_quantity": "string or null",
        "manufacturing_date": "string or null",
        "expiry_date": "string or null",
        "defect_description": "string or null"
    }
    """
    messages = [SystemMessage(content=system_prompt), HumanMessage(content=document_text)]
    res = llm.invoke(messages)
    cleaned = res.content.strip().strip("```json").strip("```")
    return json.loads(cleaned)

# ------------------------------------------------------------------
# Tool 4: Risk Assessment Tool
# ------------------------------------------------------------------
@tool
def assess_risk_tool(complaint_data: dict) -> dict:
    """Performs pharma QMS risk reasoning (Severity, Next Action)."""
    system_prompt = f"""
    Based on this complaint data: {json.dumps(complaint_data)}
    Evaluate severity (Critical / Major / Minor) and recommend immediate QMS next actions.
    Return strictly JSON:
    {{
        "risk_severity": "Critical | Major | Minor",
        "next_action": "Recommended immediate action step"
    }}
    """
    messages = [SystemMessage(content=system_prompt)]
    res = llm.invoke(messages)
    cleaned = res.content.strip().strip("```json").strip("```")
    return json.loads(cleaned)

# ------------------------------------------------------------------
# Tool 5: CAPA Recommendation Tool
# ------------------------------------------------------------------
@tool
def suggest_capa_tool(complaint_data: dict) -> dict:
    """Suggests Root Cause and CAPA actions for QA investigation."""
    system_prompt = f"""
    Given the complaint: {json.dumps(complaint_data)}
    Provide standard pharmaceutical 5-Why root cause hypothesis and CAPA recommendations.
    Return strictly JSON:
    {{
        "suggested_root_cause": "Hypothesized root cause",
        "recommended_capa": "Corrective & Preventive Actions"
    }}
    """
    messages = [SystemMessage(content=system_prompt)]
    res = llm.invoke(messages)
    cleaned = res.content.strip().strip("```json").strip("```")
    return json.loads(cleaned)

# ------------------------------------------------------------------
# Tool 6: Complaint Completeness Checker Tool
# ------------------------------------------------------------------
@tool
def check_completeness_tool(complaint_data: dict) -> dict:
    """Checks if all critical pharmaceutical QMS fields are present."""
    required_fields = ["product_name", "batch_number", "affected_quantity", "defect_description"]
    missing_fields = [field.replace("_", " ").title() for field in required_fields if not complaint_data.get(field)]
    
    if not missing_fields:
        return {
            "completeness_score": "100%",
            "completeness_status": "Complete",
            "missing_fields": []
        }
    else:
        return {
            "completeness_score": f"{int((1 - len(missing_fields)/len(required_fields)) * 100)}%",
            "completeness_status": "Incomplete",
            "missing_fields": missing_fields
        }

# ------------------------------------------------------------------
# LangGraph Workflow Construction
# ------------------------------------------------------------------
def execute_qms_agent(user_input: str, action_type: str = "log", current_data: dict = None) -> dict:
    current_data = current_data or {}
    
    # 1. Extraction step based on action
    if action_type == "edit":
        extracted = edit_complaint_tool.invoke({"prompt": user_input, "current_data": current_data})
    elif action_type == "document":
        extracted = extract_document_tool.invoke({"document_text": user_input})
    else:
        extracted = log_complaint_tool.invoke({"prompt": user_input})
    
    # Merge existing and newly extracted data
    merged = {**current_data, **extracted}
    
    # 2. Risk Reasoning
    risk_info = assess_risk_tool.invoke({"complaint_data": merged})
    
    # 3. CAPA Reasoning
    capa_info = suggest_capa_tool.invoke({"complaint_data": merged})
    
    # 4. Bonus Completeness Check
    completeness_info = check_completeness_tool.invoke({"complaint_data": merged})

    # Combine everything into complete state
    final_form_state = {
        **merged,
        **risk_info,
        **capa_info,
        **completeness_info
    }
    
    return {
        "form_data": final_form_state,
        "assistant_message": f"Updated complaint details for '{final_form_state.get('product_name', 'Product')}'. Risk severity set to {final_form_state.get('risk_severity', 'Major')}."
    }