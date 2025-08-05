import { Router } from "express";
import { getLoginURL, exchangeCodeForToken } from "../services/spotifyAuth";
import { saveToken } from "../services/tokenStore";
import {
  fetchRelatedArtists,
  fetchTopArtists,
  fetchFollowedArtists,
  fetchTopTracks,
  fetchSpotifyProfile,
} from "../services/spotifyData";
import { fetchWithCache } from "../services/cache";
import { getValidToken } from "../services/spotifyToken";

const router = Router();

router.get("/login", (req, res) => {
  const loginURL = getLoginURL();
  res.redirect(loginURL);
});

router.get("/callback", async (req, res) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).send("Missing code param");

  try {
    const token = await exchangeCodeForToken(code);

    const profile = await fetchSpotifyProfile(token.access_token);
    const spotifyUserId = profile.id;

    const expiresAt = Date.now() + token.expires_in * 1000;
    saveToken(
      spotifyUserId,
      token.access_token,
      token.refresh_token!,
      expiresAt
    );

    res.send(`Logged in as Spotify user ${spotifyUserId}`);
  } catch (err) {
    console.error("Spotify callback error:", err);
    res.status(500).send("Something went wrong");
  }
});

router.get("/me", async (req, res) => {
  const token = await getValidToken("me");
  if (!token) return res.status(401).json({ error: "Token not found" });

  try {
    const me = await fetchWithCache("spotify:me", 600, () =>
      fetchSpotifyProfile(token)
    );

    res.json(me);
  } catch (err) {
    console.error("Error fetching top artists:", err);
    res.status(500).send("Failed to fetch artists");
  }
});

router.get("/top-artists", async (req, res) => {
  const token = await getValidToken("me");
  if (!token) return res.status(401).json({ error: "Token not found" });

  try {
    const artists = await fetchWithCache("spotify:me:top-artists", 600, () =>
      fetchTopArtists(token)
    );

    res.json(artists.map((artist) => artist.name));
  } catch (err) {
    console.error("Error fetching top artists:", err);
    res.status(500).send("Failed to fetch artists");
  }
});

router.get("/following-artists", async (req, res) => {
  const token = await getValidToken("me");
  if (!token) return res.status(401).json({ error: "Token not found" });

  try {
    const followedArtists = await fetchWithCache(
      "spotify:me:following-artists",
      600,
      () => fetchFollowedArtists(token)
    );

    res.json(followedArtists.map((a) => a.name));
  } catch (err) {
    console.error("Error fetching following artists:", err);
    res.status(500).send("Failed to fetch following artists");
  }
});

router.get("/top-tracks", async (req, res) => {
  const token = await getValidToken("me");
  if (!token) return res.status(401).json({ error: "Token not found" });

  try {
    const tracks = await fetchWithCache("spotify:me:top-tracks", 600, () =>
      fetchTopTracks(token)
    );

    res.json(tracks.map((t) => t.name));
  } catch (err) {
    console.error("Error fetching top tracks:", err);
    res.status(500).send("Failed to fetch top tracks");
  }
});

router.get("/related-artists", async (req, res) => {
  const token = await getValidToken("me");
  if (!token) return res.status(401).json({ error: "Token not found" });

  try {
    const related = await fetchWithCache(
      "spotify:me:related-artists",
      600,
      async () => {
        const topArtists = await fetchTopArtists(token);
        const result = new Map();

        for (const artist of topArtists) {
          try {
            const related = await fetchRelatedArtists(token, artist.id);
            result.set(
              artist.name,
              related.map((a) => a.name)
            );
          } catch (err) {
            console.error(`Failed for ${artist.name}`, err);
            result.set(artist.name, []);
          }
        }

        return Object.fromEntries(result);
      }
    );

    res.json(related);
  } catch (err) {
    console.error("Error fetching related artists:", err);
    res.status(500).send("Failed to fetch related artists");
  }
});

router.get("/genres", async (req, res) => {
  const token = await getValidToken("me");
  if (!token) return res.status(401).json({ error: "Token not found" });

  try {
    const genreCounts = await fetchWithCache(
      "spotify:me:genres",
      600,
      async () => {
        const artists = await fetchTopArtists(token);
        const counts: Record<string, number> = {};

        artists.forEach((artist) => {
          artist.genres.forEach((genre) => {
            counts[genre] = (counts[genre] || 0) + 1;
          });
        });

        return counts;
      }
    );

    res.json(genreCounts);
  } catch (err) {
    console.error("Error fetching genres:", err);
    res.status(500).send("Failed to fetch genres");
  }
});

export default router;
