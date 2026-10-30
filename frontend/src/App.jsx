import React, { useState, useEffect, useMemo } from "react";
import {
  Clapperboard,
  Search,
  Bookmark,
  BookmarkCheck,
  Star,
  Play,
  X,
  CalendarDays,
  Film,
  Tv,
  Globe2,
  Languages,
  Clock3,
  ExternalLink,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const API =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const FALLBACK =
  "https://placehold.co/400x600/17171f/999?text=No+Poster";

// Kriti Sanon hero image
const KRITI_IMAGE = "/kriti-hero.png";

async function api(path) {
  const response = await fetch(API + path);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw Error(data.detail || "Could not load data");
  }

  return data;
}

const year = (date) => date?.slice(0, 4) || "Year unknown";

const rating = (value) =>
  Number(value) > 0 ? Number(value).toFixed(1) : "—";

const formatDate = (date) =>
  date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not confirmed";

function Card({ item, open, saved, toggle }) {
  return (
    <article className="card">
      <button className="poster" onClick={() => open(item)}>
        <img
          src={item.poster || FALLBACK}
          alt={item.title}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = FALLBACK;
          }}
        />

        <span className="rating">
          <Star size={12} fill="currentColor" />
          {rating(item.rating_tmdb)}
        </span>

        <span className="open">↗</span>
      </button>

      <button className="title" onClick={() => open(item)}>
        {item.title}
      </button>

      <div className="meta">
        {year(item.release_date)} ·{" "}
        {item.media_type === "tv" ? "Series" : "Movie"}

        <button
          className={saved ? "saved" : ""}
          onClick={() => toggle(item)}
          title="Toggle watchlist"
          aria-label="Toggle watchlist"
        >
          {saved ? (
            <BookmarkCheck size={16} />
          ) : (
            <Bookmark size={16} />
          )}
        </button>
      </div>
    </article>
  );
}

function Fact({ icon, label, value }) {
  return (
    <div className="fact">
      <span>{icon}</span>

      <div>
        <small>{label}</small>
        <b>{value || "Not listed"}</b>
      </div>
    </div>
  );
}

function Details({ item, close, saved, toggle }) {
  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    setDetails(null);
    setError("");

    api(`/api/details/${item.media_type}/${item.id}`)
      .then((data) => {
        if (mounted) setDetails(data);
      })
      .catch((err) => {
        if (mounted) setError(err.message);
      });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      mounted = false;
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [item, close]);

  const backgroundImage =
    details?.backdrop ||
    item.backdrop ||
    item.poster ||
    "";

  return (
    <div
      className="overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="modal">
        <button className="close" onClick={close} aria-label="Close">
          <X />
        </button>

        <div
          className="detail-hero"
          style={{
            backgroundImage: `
              linear-gradient(90deg, #0b0b10 0%, #0b0b10c9 55%, #0b0b1022),
              linear-gradient(0deg, #0b0b10, transparent),
              url("${backgroundImage}")
            `,
          }}
        >
          <small className="eyebrow">
            {item.media_type === "tv"
              ? "SERIES PROFILE"
              : "MOVIE PROFILE"}
          </small>

          <h2>{details?.title || item.title}</h2>

          <div className="pills">
            <span>
              {year(details?.release_date || item.release_date)}
            </span>

            <span>
              TMDB ★ {rating(details?.rating_tmdb ?? item.rating_tmdb)}
            </span>

            {details?.imdb_rating && (
              <span>IMDb ★ {details.imdb_rating}/10</span>
            )}
          </div>

          <p>
            {details?.overview ||
              item.overview ||
              "No synopsis available."}
          </p>

          <div className="actions">
            {details?.trailer && (
              <a
                className="primary"
                href={details.trailer}
                target="_blank"
                rel="noreferrer"
              >
                <Play size={16} />
                Watch trailer
                <ExternalLink size={13} />
              </a>
            )}

            <button
              className="secondary"
              onClick={() => toggle(item)}
            >
              {saved ? (
                <BookmarkCheck size={16} />
              ) : (
                <Bookmark size={16} />
              )}

              {saved ? "Saved" : "Add to watchlist"}
            </button>
          </div>
        </div>

        {!details && !error && (
          <p className="loading">Loading details…</p>
        )}

        {error && <p className="error">{error}</p>}

        {details && (
          <div className="detail-grid">
            <div>
              <section>
                <h3>About this title</h3>

                <div className="facts">
                  <Fact
                    icon={<CalendarDays />}
                    label="Release date"
                    value={formatDate(details.release_date)}
                  />

                  <Fact
                    icon={<Languages />}
                    label="Original language"
                    value={details.original_language?.toUpperCase()}
                  />

                  <Fact
                    icon={<Film />}
                    label="Genres"
                    value={details.genres?.join(", ")}
                  />

                  <Fact
                    icon={<Globe2 />}
                    label="Country / origin"
                    value={details.countries?.join(", ")}
                  />

                  {details.runtime_minutes && (
                    <Fact
                      icon={<Clock3 />}
                      label="Runtime / episode"
                      value={`${details.runtime_minutes} min`}
                    />
                  )}

                  {details.certification_india && (
                    <Fact
                      icon={<Tv />}
                      label="India age rating"
                      value={details.certification_india}
                    />
                  )}

                  {details.seasons && (
                    <Fact
                      icon={<Tv />}
                      label="Seasons"
                      value={details.seasons}
                    />
                  )}

                  {details.episodes && (
                    <Fact
                      icon={<Film />}
                      label="Episodes"
                      value={details.episodes}
                    />
                  )}
                </div>
              </section>

              <section>
                <h3>
                  Where to watch <small className="region">INDIA</small>
                </h3>

                {details.providers?.length ? (
                  <>
                    <div className="providers">
                      {details.providers.map((provider, index) => (
                        <a
                          className="provider"
                          key={provider.name + index}
                          href={provider.link || "#"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {provider.logo && (
                            <img
                              src={provider.logo}
                              alt=""
                            />
                          )}

                          <span>
                            <b>{provider.name}</b>
                            <small>{provider.category}</small>
                          </span>

                          <ExternalLink size={13} />
                        </a>
                      ))}
                    </div>

                    {details.provider_link && (
                      <a
                        className="source"
                        href={details.provider_link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Check provider listing ↗
                      </a>
                    )}

                    <p className="note">
                      Availability can change; confirm with the service
                      before subscribing.
                    </p>
                  </>
                ) : (
                  <p className="note">
                    No India provider listing found for this title.
                  </p>
                )}
              </section>

              <section>
                <h3>Audio & subtitles</h3>

                <p className="note">{details.language_note}</p>

                <div className="language-columns">
                  <div>
                    <b>Audio</b>

                    {details.audio_languages?.length ? (
                      <div className="language-list">
                        {details.audio_languages.map((language, index) => (
                          <span key={language + index}>{language}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="note">
                        Not listed by the provider.
                      </p>
                    )}
                  </div>

                  <div>
                    <b>Subtitles</b>

                    {details.subtitle_languages?.length ? (
                      <div className="language-list">
                        {details.subtitle_languages.map(
                          (language, index) => (
                            <span key={language + index}>
                              {language}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="note">
                        Not listed by the provider.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h3>OTT availability dates</h3>

                <p className="note">{details.ott_note}</p>

                {details.ott_options?.length ? (
                  <div className="ott-options">
                    {details.ott_options.map((option, index) => (
                      <div
                        className="ott-option"
                        key={option.service + index}
                      >
                        <div>
                          <b>{option.service}</b>
                          <small>{option.type}</small>
                        </div>

                        <span>
                          {option.available_since
                            ? formatDate(option.available_since)
                            : "Date not listed"}
                        </span>

                        {option.link && (
                          <a
                            href={option.link}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={"Open " + option.service}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="note">
                    No service-specific date is available for this title.
                  </p>
                )}
              </section>
            </div>

            <aside>
              <section>
                <h3>Cast</h3>

                <div className="cast">
                  {details.cast?.map((person) => (
                    <div key={person.id}>
                      <img
                        src={
                          person.photo ||
                          "https://placehold.co/60x70/222/999?text=+"
                        }
                        alt={person.name}
                      />

                      <span>
                        <b>{person.name}</b>
                        <small>{person.character}</small>
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {details.crew?.length > 0 && (
                <section>
                  <h3>Key crew</h3>

                  {details.crew.map((person, index) => (
                    <p className="crew" key={index}>
                      <b>{person.name}</b>
                      <small>{person.job}</small>
                    </p>
                  ))}
                </section>
              )}

              <section>
                <h3>Ratings</h3>

                <p className="note">
                  TMDB: <b>{rating(details.rating_tmdb)}</b>
                  {" · "}
                  IMDb: <b>{details.imdb_rating || "Not available"}</b>
                </p>

                <p className="note">{details.rating_note}</p>
              </section>
            </aside>

            <p className="attribution">
              {details.attribution} CineScope is not endorsed or
              certified by TMDB.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [trending, setTrending] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState(null);
  const [view, setView] = useState("home");

  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("cinescope-watchlist") || "[]"
      );
    } catch {
      return [];
    }
  });

  const savedIds = useMemo(
    () =>
      new Set(
        watchlist.map(
          (item) => item.media_type + "-" + item.id
        )
      ),
    [watchlist]
  );

  useEffect(() => {
    Promise.all([
      api("/api/trending"),
      api("/api/upcoming"),
    ])
      .then(([trendingData, upcomingData]) => {
        setTrending(trendingData.results || []);
        setUpcoming(upcomingData.results || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      api("/api/search?query=" + encodeURIComponent(query))
        .then((data) => setResults(data.results || []))
        .catch((err) => setError(err.message));
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  function toggleWatchlist(item) {
    setWatchlist((previous) => {
      const key = item.media_type + "-" + item.id;

      const next = previous.some(
        (saved) => saved.media_type + "-" + saved.id === key
      )
        ? previous.filter(
            (saved) => saved.media_type + "-" + saved.id !== key
          )
        : [{ ...item }, ...previous];

      localStorage.setItem(
        "cinescope-watchlist",
        JSON.stringify(next)
      );

      return next;
    });
  }

  function navigate(nextView) {
    setView(nextView);
    setQuery("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const hero = trending.find((item) => item.backdrop) || trending[0];

  const items = query.trim()
    ? results
    : view === "watchlist"
    ? watchlist
    : view === "upcoming"
    ? upcoming
    : view === "movies"
    ? trending.filter((item) => item.media_type === "movie")
    : view === "series"
    ? trending.filter((item) => item.media_type === "tv")
    : trending;

  const headings = {
    home: "Discover something unforgettable",
    movies: "Explore movies",
    series: "Explore series",
    upcoming: "Coming up",
    watchlist: "Your watchlist",
  };

  return (
    <div className="app">
      <header>
        <button
          className="brand"
          onClick={() => navigate("home")}
        >
          <span>
            <Clapperboard />
          </span>
          CINE <b>SCOPE</b>
        </button>

        <nav>
          {[
            ["home", "Home"],
            ["movies", "Movies"],
            ["series", "Series"],
            ["upcoming", "Coming soon"],
          ].map(([value, label]) => (
            <button
              className={view === value ? "active" : ""}
              onClick={() => navigate(value)}
              key={value}
            >
              {label}
            </button>
          ))}
        </nav>

        <button
          className="watch-nav"
          onClick={() => navigate("watchlist")}
        >
          <Bookmark size={16} />
          Watchlist
          <i>{watchlist.length}</i>
        </button>
      </header>

      <main>
        {!query.trim() && view === "home" && (
          <section
            className="hero"
            style={{
              backgroundImage: `
                linear-gradient(90deg, #09090d 0%, #09090dcc 38%, #09090d22 100%),
                linear-gradient(0deg, #09090d, transparent 55%),
                url("${KRITI_IMAGE}")
              `,
              backgroundPosition: "center, center, right 20%",
              backgroundSize: "cover, cover, auto 120%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div>
              <small className="eyebrow">
                <Sparkles size={13} />
                YOUR NEXT FAVORITE STARTS HERE
              </small>

              <h1>
                Stories worth
                <br />
                <em>staying up for.</em>
              </h1>

              <p>
                Discover films and series, explore the details that
                matter, and decide what to watch next.
              </p>

              <div className="actions">
                {hero && (
                  <button
                    className="primary"
                    onClick={() => setActive(hero)}
                  >
                    <Play size={16} />
                    Explore featured title
                  </button>
                )}

                <button
                  className="secondary"
                  onClick={() => navigate("upcoming")}
                >
                  <CalendarDays size={16} />
                  Upcoming releases
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="search">
          <div>
            <b>Find your next watch</b>
            <small>
              Search movies, series, old favourites, or hidden gems
            </small>
          </div>

          <label>
            <Search size={18} />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search movies and series…"
            />

            {query && (
              <button onClick={() => setQuery("")}>
                <X size={16} />
              </button>
            )}
          </label>
        </section>

        {error && (
          <div className="error">
            {error} — check that the backend is running and the API
            key is set.
          </div>
        )}

        {busy ? (
          <p className="loading">Finding stories for you…</p>
        ) : (
          <section className="content">
            <div className="heading">
              <div>
                <h2>
                  {query.trim()
                    ? `Results for “${query}”`
                    : headings[view]}
                </h2>

                <small>
                  {query.trim()
                    ? "Matching movies and series"
                    : view === "watchlist"
                    ? "Your next movie night starts here."
                    : "A world of stories, one search away."}
                </small>
              </div>

              <span>{items.length} TITLES</span>
            </div>

            {items.length ? (
              <div className="grid">
                {items.slice(0, 24).map((item) => (
                  <Card
                    key={item.media_type + item.id}
                    item={item}
                    open={setActive}
                    saved={savedIds.has(
                      item.media_type + "-" + item.id
                    )}
                    toggle={toggleWatchlist}
                  />
                ))}
              </div>
            ) : (
              <div className="empty">
                <Film size={28} />

                <b>
                  {view === "watchlist"
                    ? "Your watchlist is waiting"
                    : "No titles found"}
                </b>

                <small>
                  {view === "watchlist"
                    ? "Tap a bookmark on any poster to save it here."
                    : "Try a different search or check your spelling."}
                </small>
              </div>
            )}
          </section>
        )}

        {!query.trim() && view === "home" && !busy && (
          <section className="content">
            <div className="heading">
              <div>
                <h2>Coming up</h2>
                <small>Upcoming and on-air listings</small>
              </div>

              <button
                className="link"
                onClick={() => navigate("upcoming")}
              >
                Explore <ChevronRight size={15} />
              </button>
            </div>

            <div className="grid">
              {upcoming.slice(0, 6).map((item) => (
                <Card
                  key={item.media_type + item.id}
                  item={item}
                  open={setActive}
                  saved={savedIds.has(
                    item.media_type + "-" + item.id
                  )}
                  toggle={toggleWatchlist}
                />
              ))}
            </div>
          </section>
        )}

        <section className="callout">
          <Sparkles />

          <div>
            <b>Less scrolling. Better stories.</b>
            <small>
              Ratings, cast, trailers and India streaming listings —
              together in one thoughtful place.
            </small>
          </div>
        </section>
      </main>

      <footer>
        <b>
          CINE<span>SCOPE</span>
        </b>

        <p>Made for people who love a good story.</p>

        <small>
          This product uses the TMDB API but is not endorsed or
          certified by TMDB. Streaming provider data is supplied
          through TMDB's JustWatch partnership.
        </small>

        <small>© {new Date().getFullYear()} CineScope</small>
      </footer>

      {active && (
        <Details
          item={active}
          close={() => setActive(null)}
          saved={savedIds.has(
            active.media_type + "-" + active.id
          )}
          toggle={toggleWatchlist}
        />
      )}
    </div>
  );
}