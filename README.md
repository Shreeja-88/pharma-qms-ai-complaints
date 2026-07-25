# Pharma QMS - AI-Powered Customer Complaint Management System

## Overview

Pharma QMS is an AI-powered Quality Management System (QMS) designed for pharmaceutical manufacturing organizations involved in Active Pharmaceutical Ingredients (API) and Finished Dosage Forms (FDF). The platform streamlines customer complaint management by combining modern web technologies with Large Language Models (LLMs) orchestrated through LangGraph.

The application enables Quality Assurance teams to capture, process, analyze, and update customer complaints using natural language interactions. It also provides AI-assisted document parsing, complaint editing, risk assessment, and Corrective and Preventive Action (CAPA) recommendations while maintaining data consistency throughout the complaint lifecycle.

---

# Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Workflow](#system-workflow)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [AI Workflow](#ai-workflow)
- [LangGraph Tools](#langgraph-tools)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database](#database)
- [AI Models](#ai-models)
- [Example Workflow](#example-workflow)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

# Features

## AI Complaint Logging

Create new customer complaints using natural language instead of manually filling forms.

The AI extracts structured information including:

- Product Name
- Product Strength
- Batch Number
- Manufacturing Date
- Expiry Date
- Complaint Description
- Customer Information
- Quantity Affected
- Date of Complaint

---

## Intelligent Complaint Editing

Modify existing complaint records using conversational prompts.

Instead of replacing the complete record, the AI selectively updates only the requested fields while preserving every other field in the complaint.

Example:

**User Input**

> Update Batch Number to BT1025 and affected quantity to 150 units.

Only those fields are modified while all remaining information stays unchanged.

---

## AI Document Parsing

Import complaint information directly from:

- Customer emails
- Complaint reports
- Plain text files
- PDF documents

The system automatically extracts relevant information and populates the complaint record.

---

## AI Risk Assessment

The platform evaluates each complaint according to pharmaceutical quality practices.

Generated outputs include:

- Severity Classification
- Product Risk
- Patient Risk
- Immediate QA Actions
- Investigation Priority

Severity Levels:

- Critical
- Major
- Minor

---

## CAPA Recommendation Engine

Using AI reasoning and pharmaceutical quality principles, the application generates:

- Root Cause Hypotheses
- 5-Why Analysis
- Corrective Actions
- Preventive Actions
- Investigation Recommendations

---

## Split Screen User Interface

The application provides a productivity-focused interface consisting of:

### Left Panel

Read-only QMS Registry Form

Displays the structured complaint record.

### Right Panel

AI Co-Pilot

Allows users to interact using natural language.

Example prompts:

```
Create a complaint for Paracetamol tablets.
```

```
Update the batch number.
```

```
Assess complaint risk.
```

```
Suggest CAPA.
```

---

# System Workflow

```
Customer Complaint
        │
        ▼
AI Complaint Extraction
        │
        ▼
Structured Complaint Record
        │
        ▼
Complaint Editing
        │
        ▼
Document Parsing
        │
        ▼
Risk Assessment
        │
        ▼
CAPA Recommendation
        │
        ▼
Quality Assurance Review
```

---

# Architecture

```
                 React + Redux Frontend
                         │
                         │ REST API
                         ▼
                   FastAPI Backend
                         │
         ┌───────────────┴────────────────┐
         │                                │
         ▼                                ▼
   LangGraph Agent                  SQL Database
         │
         ▼
     LangChain Groq
         │
         ▼
Large Language Model
```

---

# Technology Stack

## Frontend

- React.js
- Redux Toolkit
- Axios
- Lucide React
- Google Inter Font
- CSS

---

## Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic

Supported Databases:

- SQLite
- MySQL
- PostgreSQL

---

## AI

- LangGraph
- LangChain
- Groq API

Supported Models

- llama-3.3-70b-versatile
- gemma2-9b-it

---

# AI Workflow

```
User Prompt
      │
      ▼
Intent Detection
      │
      ▼
LangGraph Routing
      │
      ├───────────────┐
      │               │
      ▼               ▼
Complaint Tool    Edit Tool
      │               │
      ├───────────────┤
      ▼
Document Parser
      │
      ▼
Risk Assessment
      │
      ▼
CAPA Generator
      │
      ▼
Updated Complaint State
```

---

# LangGraph Tools

## 1. log_complaint_tool

Creates new complaint records from natural language.

Responsibilities

- Extract complaint information
- Validate fields
- Structure output
- Store complaint

---

## 2. edit_complaint_tool

Updates only requested fields while maintaining the existing complaint state.

Responsibilities

- Field identification
- Partial updates
- State preservation

---

## 3. extract_document_tool

Processes complaint documents and extracts structured information.

Supported Inputs

- PDF
- Plain Text
- Email Content

Extracted Information

- Product
- Batch
- Dates
- Complaint Description
- Customer Details

---

## 4. assess_risk_tool

Performs AI-driven complaint evaluation.

Outputs

- Severity
- Risk Summary
- Immediate Actions
- QA Recommendations

---

## 5. suggest_capa_tool

Generates pharmaceutical CAPA recommendations.

Outputs

- Root Cause
- Five Why Analysis
- Corrective Action
- Preventive Action

---

# Project Structure

```
pharma-qms-ai-complaints/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── routers/
│   ├── agents/
│   ├── tools/
│   ├── services/
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── redux/
│   │   ├── pages/
│   │   ├── api/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── LICENSE
```

---

# Installation

## Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- npm
- Groq API Key

---

# Backend Setup

Clone the repository.

```bash
git clone https://github.com/Shreeja-88/pharma-qms-ai-complaints.git

cd pharma-qms/backend
```

Create a virtual environment.

```bash
python -m venv venv
```

Activate the environment.

Windows

```bash
venv\Scripts\activate
```

Linux/macOS

```bash
source venv/bin/activate
```

Install dependencies.

```bash
pip install -r requirements.txt
```

Create a `.env` file.

```
GROQ_API_KEY=your_api_key
DATABASE_URL=sqlite:///./qms_complaints.db
```

Run the backend.

```bash
uvicorn main:app --reload
```

Backend URL

```
http://127.0.0.1:8000
```

Swagger Documentation

```
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

Open another terminal.

```bash
cd frontend
```

Install dependencies.

```bash
npm install
```

Start the application.

```bash
npm run dev
```

Application URL

```
http://localhost:5173
```

---

# Environment Variables

| Variable | Description |
|-----------|-------------|
| GROQ_API_KEY | Groq API Key |
| DATABASE_URL | SQL Database Connection String |

---

# Database

The application supports multiple relational databases through SQLAlchemy.

Supported databases include:

- SQLite
- PostgreSQL
- MySQL

SQLite is used as the default development database.

---

# API Documentation

FastAPI automatically generates OpenAPI documentation.

Interactive Swagger UI

```
http://127.0.0.1:8000/docs
```

ReDoc Documentation

```
http://127.0.0.1:8000/redoc
```

---

# AI Models

Default production model:

```
llama-3.3-70b-versatile
```

Alternative model:

```
gemma2-9b-it
```

The model can be configured depending on performance, latency, or cost requirements.

---

# Example Workflow

### Step 1

User enters:

```
Log a complaint for Paracetamol 500 mg tablets. Customers reported broken tablets in Batch BT245.
```

↓

### Step 2

The AI extracts:

- Product Name
- Strength
- Batch Number
- Complaint Description

↓

### Step 3

User requests:

```
Update the affected quantity to 250 units.
```

↓

### Step 4

Only the quantity field is updated.

↓

### Step 5

User requests:

```
Assess complaint risk.
```

↓

### Step 6

The AI classifies the complaint and recommends immediate actions.

↓

### Step 7

User requests:

```
Suggest CAPA.
```

↓

### Step 8

The AI generates root causes and corrective/preventive actions.

---

# Future Enhancements

- OCR support for scanned complaint documents
- Multi-language complaint processing
- Email inbox integration
- Audit trail generation
- Electronic signatures
- Complaint analytics dashboard
- Batch trend analysis
- Regulatory compliance reporting
- Role-Based Access Control (RBAC)
- Docker deployment
- Kubernetes support
- CI/CD pipelines
- Authentication with JWT or OAuth2

---

# Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch.
5. Submit a Pull Request.

Please ensure that all new features include appropriate documentation and tests.

---

# License

This project is licensed under the MIT License.

See the LICENSE file for additional information.