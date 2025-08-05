import axios from "axios";
import qs from "querystring";
import { SpotifyTokenResponse } from "../types/spotify";
import { getTokenRow, saveToken } from "./tokenStore";

export async function refreshSpotifyToken(
  refreshToken: string
): Promise<SpotifyTokenResponse> {
  const payload = qs.stringify({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
  });

  const res = await axios.post<SpotifyTokenResponse>(
    "https://accounts.spotify.com/api/token",
    payload,
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  return res.data;
}

export async function getValidToken(
  userId: string
): Promise<string | undefined> {
  const tokenData = getTokenRow(userId);
  if (!tokenData) return undefined;

  const now = Date.now();
  if (tokenData.expires_at && tokenData.expires_at > now) {
    return tokenData.access_token;
  }

  if (!tokenData.refresh_token) {
    console.error("Missing refresh token for user:", userId);
    return undefined;
  }

  const refreshed = await refreshSpotifyToken(tokenData.refresh_token);
  const newExpiresAt = Date.now() + refreshed.expires_in * 1000;

  saveToken(
    userId,
    refreshed.access_token,
    refreshed.refresh_token ?? tokenData.refresh_token,
    newExpiresAt
  );

  return refreshed.access_token;
}
