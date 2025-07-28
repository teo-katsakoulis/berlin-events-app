import { Router } from "express";
import {
  getLoginURL,
  exchangeCodeForToken,
  fetchTopArtists,
} from "../services/spotify";
import { saveToken } from "../services/tokenStore";

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
    saveToken("me", token);
    const topArtists = await fetchTopArtists(token);

    // For now just print in console
    console.log(
      "Top Artists:",
      topArtists.map((a) => a.name)
    );
    res.json(topArtists.map((a) => a.name));
  } catch (err) {
    console.error("Spotify callback error:", err);
    res.status(500).send("Something went wrong");
  }
});

export default router;
