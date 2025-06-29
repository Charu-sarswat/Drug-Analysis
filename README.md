# Drug Analysis Web Application

A MERN + Python-based web application for analyzing drug properties using real, pretrained models and APIs.

## Project Structure
- `/client` - React frontend (Vite)
- `/server` - Express backend
- `/ai-service` - Python FastAPI microservice

## Setup Instructions

### 1. Environment Setup
1. Copy `.env.example` to `.env` in both `/server` and `/client` directories
2. Update the environment variables with your MongoDB Atlas URI and FastAPI URL

### 2. Backend Setup
```bash
cd server
npm install
npm run dev
```

### 3. Python Microservice Setup
```bash
cd ai-service
python -m venv venv
# On Windows
venv\Scripts\activate
# On Unix/MacOS
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

### 4. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Features
- Drug property analysis using real APIs and pretrained models
- Historical data storage and retrieval
- Real-time property predictions
- Genome-related risk assessment

## Technologies Used
- Frontend: React, Vite, Axios, React Router
- Backend: Node.js, Express, MongoDB
- AI Service: Python, FastAPI, DeepPurpose, DeepChem
- APIs: PubChem, PharmGKB #   D r u g - A n a l y s i s  
 