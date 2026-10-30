# 🎬 CineScope

**Discover your next watch.** CineScope is a movie and TV discovery web app that brings movie details, ratings, cast information, trailers, and streaming availability together in one place.

## ✨ Features

- Browse movies and TV series.
- Search for titles.
- Explore trending and upcoming titles.
- View title details, including ratings, overview, cast, and crew where available.
- Watch trailers through YouTube links when available.
- Check India streaming-provider availability where supported by the data source.
- View available audio and subtitle languages when supplied by the streaming data provider.
- Save titles to a personal watchlist.

> **Data note:** Streaming availability and language information depend on third-party provider data and may not be available for every title. A streaming option's `availableSince` date can indicate when availability was first detected by the data provider; it is not necessarily the official OTT premiere date.

## 🧰 Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Python
- FastAPI
- Uvicorn

### Data providers / integrations
- TMDB — movie and TV metadata, images, and provider information.
- OMDb — IMDb ratings and related metadata when configured.
- Streaming Availability API — streaming options, audio languages, and subtitle languages when configured.
- YouTube — trailer links.

## 📁 Project Structure

```text
CineScope/
├── backend/
│   ├── main.py
│   ├── .env                 # Local API keys; do not commit this file
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   └── style.css
    ├── package.json
    └── ...
```

Your project may contain additional files and folders; keep them in place.

## 🚀 Getting Started

### Prerequisites

Install:
- Python 3.11 or a compatible Python version
- Node.js and npm
- Git (for GitHub)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/CineScope.git
cd CineScope
```

Replace `YOUR-USERNAME` with your GitHub username and use your actual repository URL.

### 2. Configure the backend

Open a terminal in the backend directory:

```powershell
cd backend
```

Create and activate a virtual environment (recommended):

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, use a terminal where activation is allowed or run the installed environment's Python directly.

Install the backend requirements:

```powershell
python -m pip install -r requirements.txt
```

Create `backend/.env` and add the API keys required by your backend. For example:

```env
TMDB_API_KEY=your_tmdb_api_key
OMDB_API_KEY=your_omdb_api_key
STREAMING_API_KEY=your_streaming_availability_api_key
```

Use the exact environment-variable names expected by your `backend/main.py`. If a provider is optional in your code, its key may be optional. **Never publish real API keys.**

Start the backend:

```powershell
python -m uvicorn main:app --reload --port 8000
```

The API should be available at `http://127.0.0.1:8000`. If FastAPI's interactive docs are enabled, open `http://127.0.0.1:8000/docs`.

### 3. Configure and start the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (commonly `http://localhost:5173`).

Keep both terminal windows running while using the app.

## 🔐 Security Checklist

Before pushing the project to GitHub:

- Ensure `.env` files are ignored by Git.
- Never commit API keys, tokens, passwords, or private credentials.
- Do not commit `node_modules/`, Python virtual environments, or cache files.
- If an API key was accidentally published, revoke/rotate it with the provider and remove it from the repository history as appropriate.

Example `.gitignore` entries (add these to your root `.gitignore` if they are not already present):

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

If the app needs environment variables, you can commit an `.env.example` containing placeholder values only.

## 🛠️ Troubleshooting

- **“Failed to fetch”**: Confirm the backend is running at `http://127.0.0.1:8000` and that the frontend is configured to use the correct backend URL.
- **No titles appear**: Check that required API keys are configured in `backend/.env` and look for errors in the backend terminal.
- **Audio/subtitle/streaming details are missing**: Not every title has complete provider data. Confirm the streaming API key and its usage limits.
- **Port already in use**: Stop the other process or choose another port and update the frontend's backend URL if needed.

## 📸 Screenshots

Add screenshots of CineScope here to show the interface on GitHub. For example, create a `screenshots/` folder and add an image, then reference it like this:

```markdown
![CineScope home page](screenshots/home.png)
```

## 🙌 Acknowledgements

- Movie and TV data is provided by third-party services including TMDB and OMDb.
- Streaming availability data is supplied by the configured streaming data provider.
- CineScope is an independent project and is not endorsed or certified by TMDB.

## 📄 License

No license has been specified yet. Add a `LICENSE` file if you decide to publish the project under an open-source license.
