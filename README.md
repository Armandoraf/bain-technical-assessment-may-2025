# Restaurant Recommendation Demo

This repository provides a full‑stack example for generating restaurant recommendations.  
It consists of a FastAPI backend and a React Router frontend.

## Repository Structure

.
├── backend # FastAPI service
├── frontend # React Router + Vite web app
└── infra # Docker Compose configuration

### Backend

- **Tech:** Python 3.12, FastAPI, Poetry.
- Exposes REST endpoints under `main.py`:
  - `/restaurants/partner-approved`
  - `/restaurants/near-you`
  - `/restaurants/recommended`
- Integrates with the Yelp API and optionally OpenAI for improved suggestions.

### Frontend

- **Tech:** React 19, React Router, Vite, TailwindCSS.
- Uses `api-fetch.ts` to call the backend (`VITE_API_URL` specifies the server).
- Contains various UI components under `app/components`.

## Requirements

- Python 3.12 with [Poetry](https://python-poetry.org/)
- Node.js 20+

The backend requires API keys for OpenAI and Yelp. The frontend has a Vite API URL that can be overridden. Copy `backend/.env.example` to `backend/.env` and fill in your credentials:

## Running Locally

### Docker Compose

```bash
cd infra
docker-compose up --build
```

If Docker doesn't work

```bash
cd frontend
npm install
cd ../backend
poetry install
```
