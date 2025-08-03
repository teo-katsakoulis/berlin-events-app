import { Router } from "express";
import { getLoginURL, exchangeCodeForToken } from "../services/spotifyAuth";
import { saveToken, getToken } from "../services/tokenStore";
import {
  fetchRelatedArtists,
  fetchTopArtists,
  fetchTopTracks,
  Artist,
} from "../services/spotifyData";

const router = Router();
const relatedArtists = new Map();

router.get("/login", (req, res) => {
  const loginURL = getLoginURL();
  res.redirect(loginURL);
});

router.get("/callback", async (req, res) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).send("Missing code param");

  try {
    const token = await exchangeCodeForToken(code);
    saveToken("me", token);
    res.send("Logged in with Spotify! You can now go to /spotify/top-artists");
  } catch (err) {
    console.error("Spotify callback error:", err);
    res.status(500).send("Something went wrong");
  }
});

router.get("/top-artists", async (req, res) => {
  const token = getToken("me");
  if (!token) return res.status(401).json({ error: "Token not found" });

  try {
    const artists = await fetchTopArtists(token);
    res.json(artists.map((a) => a.name));
  } catch (err) {
    console.error("Error fetching top artists:", err);
    res.status(500).send("Failed to fetch artists");
  }
});

router.get("/top-tracks", async (req, res) => {
  const token = getToken("me");
  if (!token) return res.status(401).json({ error: "Token not found" });

  try {
    const artists = await fetchTopTracks(token);
    res.json(artists.map((a) => a.name));
  } catch (err) {
    console.error("Error fetching top artists:", err);
    res.status(500).send("Failed to fetch artists");
  }
});

router.get("/related-artists", async (req, res) => {
  const token = getToken("me");
  if (!token) return res.status(401).json({ error: "Token not found" });

  try {
    const topArtists = await fetchTopArtists(token);

    const relatedArtists = new Map();

    for (const artist of topArtists) {
      try {
        const related = await fetchRelatedArtists(token, artist.id);
        relatedArtists.set(
          artist.name,
          related.map((a) => a.name)
        );
      } catch (err) {
        console.error(
          `Failed to fetch related for ${artist.name} (${artist.id}):`,
          (err &&
            typeof err === "object" &&
            "response" in err &&
            (err as any).response?.status) ||
            err
        );
        relatedArtists.set(artist.name, []);
      }
    }

    res.json(Object.fromEntries(relatedArtists));
  } catch (err) {
    console.error("Error fetching related artists:", err);
    res.status(500).send("Failed to fetch related artists");
  }
});

router.get("/genres", async (req, res) => {
  const token = getToken("me");
  if (!token) return res.status(401).json({ error: "Token not found" });

  try {
    const artists: Artist[] = await fetchTopArtists(token);

    const genreCounts: Record<string, number> = {};
    artists.forEach((artist) => {
      artist.genres.forEach((genre) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });

    res.json(genreCounts);
  } catch (err) {
    console.error("Error fetching genres:", err);
    res.status(500).send("Failed to fetch genres");
  }
});

export default router;
