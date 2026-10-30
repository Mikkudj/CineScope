# 🎬 CineScope — Discover Your Next Watch

CineScope is a movie and TV show discovery platform that brings trending titles, ratings, cast information, trailers, and streaming availability together in one place.

🌐 **Live Demo:** https://cinescope.divyajyotmehta.workers.dev  
⚙️ **Backend API:** https://cinescope-qwa6.onrender.com  
📚 **API Documentation:** https://cinescope-qwa6.onrender.com/docs

## ✨ Features

- 🎥 Browse movies and TV shows.
- 🔎 Search for titles.
- 🔥 Explore trending and upcoming releases.
- ⭐ View ratings, overviews, cast, and other title details.
- ▶️ Find YouTube trailer links when available.
- 📺 Check streaming availability in India where supported.
- 🌐 View available audio and subtitle languages when provided.
- ❤️ Save titles to a personal watchlist.

> **Note:** Streaming availability and language information depend on third-party data and may not be available for every title. An `availableSince` date indicates when availability was first detected by the data provider; it may not represent the official OTT release date.

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Python
- FastAPI
- Uvicorn

### APIs and Integrations
- **TMDB:** Movie and TV metadata, images, and related information.
- **OMDb:** IMDb ratings and additional metadata when configured.
- **Streaming Availability API:** Streaming options and language information when configured.
- **YouTube:** Trailer links.

## 🏗️ Architecture

CineScope uses a React frontend to provide the user interface and a FastAPI backend to handle API requests and retrieve information from external data providers.

- **Frontend hosting:** Cloudflare
- **Backend hosting:** Render
- **API communication:** HTTP/REST

## 🚀 Run Locally

### Prerequisites

Install:
- Python 3.11 or a compatible version
- Node.js and npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Mikkudj/CineScope.git
cd CineScope
```

### 2. Set Up the Backend

Open a terminal:

```powershell
cd backend
py -3.11 -m venv .venv
```

Activate the virtual environment:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the dependencies:

```powershell
python -m pip install -r requirements.txt
```

Create a `.env` file inside the `backend` directory and add the API keys required by your application:

```env
TMDB_API_KEY=your_tmdb_api_key
OMDB_API_KEY=your_omdb_api_key
STREAMING_API_KEY=your_streaming_availability_api_key
```

Use the exact environment-variable names expected by your backend code. Optional integrations may not require a key.

Start the backend:

```powershell
python -m uvicorn main:app --reload --port 8000
```

Backend URL: http://127.0.0.1:8000

Interactive API documentation: http://127.0.0.1:8000/docs

### 3. Set Up the Frontend

Open a second terminal from the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

http://localhost:5173

Keep both development servers running while testing the application.

## 🌍 Deployment

CineScope is deployed using separate frontend and backend services.

| Component | Platform |
|---|---|
| Frontend | Cloudflare |
| Backend | Render |
| Backend framework | FastAPI |
| Frontend framework | React |

The frontend uses the deployed backend URL through the `VITE_API_BASE_URL` environment variable.

For local development, configure the frontend to use your local FastAPI server.

**Deployment links:**
- Live application: https://cinescope.divyajyotmehta.workers.dev
- Backend: https://cinescope-qwa6.onrender.com
- API docs: https://cinescope-qwa6.onrender.com/docs

> **Note:** A free Render service may take some time to respond after a period of inactivity because it can enter a sleeping state.

## 🔐 Security

- Never commit real API keys or credentials.
- Keep `.env` files out of Git.
- Do not commit `node_modules`, virtual environments, or generated build files.
- Use placeholder values in any example environment file.
- If an API key is accidentally exposed, revoke or rotate it.

Example `.gitignore` entries:

```gitignore
.env
.env.*
!.env.example
.venv/
venv/
__pycache__/
*.py[cod]
node_modules/
dist/
```

Check your existing `.gitignore` before adding these entries.

## 🐛 Troubleshooting

**Failed to fetch**
- Check whether the backend is running.
- Verify that the frontend is using the correct backend URL.
- Check the browser console and backend logs for errors.

**Titles or details are missing**
- Verify the required API keys.
- Check the backend logs for API errors or rate limits.

**Streaming or language information is unavailable**
- Some titles may not have complete provider data.
- Verify the streaming API configuration and usage limits.

**Port already in use**
- Stop the process using the port or configure a different port.

## 🙌 Acknowledgements

- [TMDB](https://www.themoviedb.org/) for movie and TV metadata.
- [OMDb API](https://www.omdbapi.com/) for additional metadata when configured.
- [YouTube](https://www.youtube.com/) for trailer links.
- The configured streaming data provider for streaming availability information.

CineScope is an independent project and is not endorsed or certified by TMDB.

## 📄 License

No open-source license has been specified yet. Unless a license is added, the repository should not be assumed to grant others permission to reuse or redistribute its code.