import os
from datetime import datetime, timezone
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cinescope.divyajyotmehta.workers.dev",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

KEY = os.getenv("TMDB_API_KEY", "").strip()
OMDB = os.getenv("OMDB_API_KEY", "").strip()
STREAMING_API_KEY = os.getenv("STREAMING_API_KEY", "").strip()

BASE = "https://api.themoviedb.org/3"
IMG = "https://image.tmdb.org/t/p"

app = FastAPI(title="CineScope API", version="1.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["GET"],
    allow_headers=["*"],
)


def get(path, params=None):
    if not KEY or KEY == "put_your_tmdb_api_key_here":
        raise HTTPException(
            status_code=500,
            detail="Add your TMDB API key to backend/.env, then restart the backend."
        )

    p = {
        "api_key": KEY,
        "language": "en-US",
    }
    p.update(params or {})

    try:
        response = requests.get(
            BASE + path,
            params=p,
            timeout=20
        )

        if response.status_code == 401:
            raise HTTPException(
                status_code=502,
                detail="TMDB rejected the key. Check backend/.env."
            )

        response.raise_for_status()
        return response.json()

    except HTTPException:
        raise

    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail="TMDB could not be reached. Check your internet connection and API key."
        )


def img(path, size="w500"):
    return f"{IMG}/{size}{path}" if path else None


def language_label(value):
    """Convert a Streaming Availability locale object into a readable label."""
    if isinstance(value, str):
        return value.strip()
    if not isinstance(value, dict):
        return None

    # API locale objects may contain language, region, or a locale code.
    language = value.get("language") or value.get("name") or value.get("code")
    region = value.get("region")
    script = value.get("script")

    if isinstance(language, dict):
        language = language.get("name") or language.get("code")

    parts = [str(part).strip() for part in (language, script, region) if part]
    return " ".join(dict.fromkeys(parts)) or None


def availability_since(timestamp):
    """Return the API's first-detected date, not an assumed official premiere date."""
    try:
        return datetime.fromtimestamp(int(timestamp), tz=timezone.utc).date().isoformat()
    except (TypeError, ValueError, OSError, OverflowError):
        return None


def get_streaming_availability(imdb_id):
    """Fetch verified streaming options, audio, subtitles and first-detected dates."""
    if not STREAMING_API_KEY or not imdb_id:
        return [], [], [], False

    try:
        response = requests.get(
            f"https://api.movieofthenight.com/v4/shows/{imdb_id}",
            headers={"X-API-Key": STREAMING_API_KEY},
            params={"country": "in"},
            timeout=12,
        )
        response.raise_for_status()
        data = response.json()
        country_options = (data.get("streamingOptions") or {}).get("in", [])

        options = []
        audio_languages = set()
        subtitle_languages = set()

        for option in country_options:
            service = option.get("service") or {}
            audios = []
            subtitles = []

            for audio in option.get("audios") or []:
                label = language_label(audio)
                if label:
                    audios.append(label)
                    audio_languages.add(label)

            for subtitle in option.get("subtitles") or []:
                locale = subtitle.get("locale") if isinstance(subtitle, dict) else subtitle
                label = language_label(locale)
                if label:
                    # Keep closed-caption status clear where the API supplies it.
                    if isinstance(subtitle, dict) and subtitle.get("closedCaptions"):
                        label = f"{label} (CC)"
                    subtitles.append(label)
                    subtitle_languages.add(label)

            options.append({
                "service": service.get("name") or "Streaming service",
                "type": option.get("type") or "Available",
                "link": option.get("videoLink") or option.get("link"),
                "available_since": availability_since(option.get("availableSince")),
                "audios": sorted(set(audios), key=str.casefold),
                "subtitles": sorted(set(subtitles), key=str.casefold),
            })

        return (
            options,
            sorted(audio_languages, key=str.casefold),
            sorted(subtitle_languages, key=str.casefold),
            True,
        )
    except (requests.RequestException, ValueError, TypeError) as error:
        # Optional service: keep CineScope usable even if this API is unavailable.
        print("Streaming Availability API request failed:", error)
        return [], [], [], False


def clean(x, kind=None):
    return {
        "id": x.get("id"),
        "media_type": kind or x.get("media_type"),
        "title": x.get("title") or x.get("name") or "Untitled",
        "original_title": x.get("original_title") or x.get("original_name"),
        "overview": x.get("overview") or "",
        "release_date": x.get("release_date") or x.get("first_air_date"),
        "original_language": x.get("original_language"),
        "rating_tmdb": x.get("vote_average"),
        "poster": img(x.get("poster_path")),
        "backdrop": img(x.get("backdrop_path"), "w1280"),
    }


@app.get("/")
def home():
    return {
        "name": "CineScope API",
        "status": "ok",
        "docs": "/docs",
    }


@app.get("/api/search")
def search(query: str = Query(..., min_length=1, max_length=100)):
    data = get(
        "/search/multi",
        {
            "query": query.strip(),
            "include_adult": "false",
            "region": "IN",
        }
    )

    return {
        "results": [
            clean(item)
            for item in data.get("results", [])
            if item.get("media_type") in ("movie", "tv")
        ]
    }


@app.get("/api/trending")
def trending():
    data = get("/trending/all/week", {"region": "IN"})

    return {
        "results": [
            clean(item)
            for item in data.get("results", [])
            if item.get("media_type") in ("movie", "tv")
        ]
    }


@app.get("/api/upcoming")
def upcoming():
    movies = get(
        "/movie/upcoming",
        {"region": "IN"}
    ).get("results", [])

    shows = get("/tv/on_the_air").get("results", [])

    items = (
        [clean(item, "movie") for item in movies]
        + [clean(item, "tv") for item in shows]
    )

    return {
        "results": sorted(
            items,
            key=lambda item: item.get("release_date") or "9999"
        )[:24]
    }


@app.get("/api/details/{kind}/{item_id}")
def details(kind: str, item_id: int):
    if kind not in ("movie", "tv"):
        raise HTTPException(
            status_code=400,
            detail="kind must be movie or tv"
        )

    x = get(
        f"/{kind}/{item_id}",
        {
            "append_to_response":
                "credits,videos,external_ids,release_dates,content_ratings"
        }
    )

    # Streaming availability in India
    providers_data = get(
        f"/{kind}/{item_id}/watch/providers"
    ).get("results", {}).get("IN", {})

    # IMDb rating through OMDb
    ext = x.get("external_ids", {})
    imdb = None
    imdb_id = ext.get("imdb_id")

    # Streaming Availability API: audio, subtitles and service detection dates.
    ott_options, audio_languages, subtitle_languages, streaming_data_loaded = (
        get_streaming_availability(imdb_id)
    )

    if OMDB and imdb_id:
        try:
            response = requests.get(
                "https://www.omdbapi.com/",
                params={
                    "apikey": OMDB,
                    "i": imdb_id,
                },
                timeout=10,
            )

            response.raise_for_status()
            omdb_data = response.json()

            if omdb_data.get("Response") == "True":
                rating = omdb_data.get("imdbRating")

                if rating and rating != "N/A":
                    imdb = rating
            else:
                print("OMDb API error:", omdb_data.get("Error"))

        except requests.RequestException as error:
            print("OMDb request failed:", error)

    else:
        print("OMDb key loaded:", bool(OMDB))
        print("IMDb ID found:", imdb_id)

    # Trailer
    videos = x.get("videos", {}).get("results", [])

    trailer = next(
        (
            video for video in videos
            if video.get("site") == "YouTube"
            and video.get("type") == "Trailer"
            and video.get("official")
        ),
        None,
    )

    if not trailer:
        trailer = next(
            (
                video for video in videos
                if video.get("site") == "YouTube"
                and video.get("type") == "Trailer"
            ),
            None,
        )

    # Cast
    cast = x.get("credits", {}).get("cast", [])[:12]

    # Movie or TV-specific information
    if kind == "movie":
        countries = [
            country.get("name")
            for country in x.get("production_countries", [])
        ]

        runtime = x.get("runtime")

        certification = next(
            (
                release.get("certification")
                for region in x.get("release_dates", {}).get("results", [])
                if region.get("iso_3166_1") == "IN"
                for release in region.get("release_dates", [])
                if release.get("certification")
            ),
            None,
        )

    else:
        countries = x.get("origin_country", [])

        runtime = (
            x.get("episode_run_time") or [None]
        )[0]

        certification = next(
            (
                rating.get("rating")
                for rating in x.get("content_ratings", {}).get("results", [])
                if rating.get("iso_3166_1") == "IN"
            ),
            None,
        )

    # Streaming providers
    providers = []

    categories = [
        ("Subscription", providers_data.get("flatrate", [])),
        ("Free", providers_data.get("free", [])),
        ("With ads", providers_data.get("ads", [])),
        ("Rent", providers_data.get("rent", [])),
        ("Buy", providers_data.get("buy", [])),
    ]

    for category, provider_list in categories:
        for provider in provider_list:
            providers.append({
                "name": provider.get("provider_name"),
                "logo": img(provider.get("logo_path"), "w92"),
                "category": category,
                "link": providers_data.get("link"),
            })

    # Director, creator and writer information
    crew = [
        {
            "name": person.get("name"),
            "job": person.get("job"),
        }
        for person in x.get("credits", {}).get("crew", [])
        if person.get("job") in ("Director", "Creator", "Writer")
    ][:8]

    return {
        **clean(x, kind),

        "genres": [
            genre.get("name")
            for genre in x.get("genres", [])
        ],

        "countries": countries,
        "runtime_minutes": runtime,
        "seasons": x.get("number_of_seasons"),
        "episodes": x.get("number_of_episodes"),
        "certification_india": certification,

        "imdb_rating": imdb,

        "cast": [
            {
                "id": person.get("id"),
                "name": person.get("name"),
                "character": person.get("character"),
                "photo": img(person.get("profile_path"), "w185"),
            }
            for person in cast
        ],

        "crew": crew,

        # Trailer opens on YouTube
        "trailer": (
            f"https://www.youtube.com/watch?v={trailer['key']}"
            if trailer and trailer.get("key")
            else None
        ),

        "providers": providers,
        "provider_link": providers_data.get("link"),

        # Streaming Availability data is separate from TMDB's JustWatch provider list.
        "audio_languages": audio_languages,
        "subtitle_languages": subtitle_languages,
        "ott_options": ott_options,
        # availableSince is the API's first-detected date, not an official OTT premiere.
        "ott_release_date": None,
        "language_note": (
            "Audio and subtitle languages are based on the streaming options returned "
            "by Streaming Availability API for India. Availability can vary by plan, "
            "device, and title edition."
            if streaming_data_loaded and ott_options
            else (
                "Language information is unavailable for this title. Check that "
                "STREAMING_API_KEY is configured and that the title has an IMDb ID."
                if not streaming_data_loaded
                else "No India streaming options with language details were returned for this title."
            )
        ),
        "ott_note": (
            "The date shown for each service is when the API first detected that "
            "streaming option. It is not guaranteed to be the official OTT premiere date."
            if ott_options
            else "No confirmed India streaming-option dates were returned by the Streaming Availability API."
        ),

        "rating_note": (
            "TMDB and IMDb ratings are different. IMDb appears only when "
            "an OMDb key and rating are available."
        ),

        "attribution": (
            "This product uses the TMDB API but is not endorsed or "
            "certified by TMDB. Streaming-provider data is supplied "
            "through TMDB's JustWatch partnership."
        ),
    }