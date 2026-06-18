# BidBot — AI Construction Estimator

AI-powered construction estimating platform.

## Project Structure

- `frontend/`: React + Vite application (Intake Form)
- `backend/`: Node.js + Express application (5-Agent Pipeline)

## Getting Started

### Backend
1. `cd backend`
2. `npm install`
3. `npm start` (Runs on port 3001)

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## 5-Agent Pipeline
The backend implements a sequential execution of 5 AI agents:
1. Intake & Parser
2. Materials Estimator
3. Labor Estimator
4. Risk & Gap Analyzer
5. Bid Summary
