import axios from "axios";
import qs from "qs";

const client_id = process.env.SPOTIFY_CLIENT_ID!;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI!;

export function getLoginURL(): string {
  const scopes = ["user-top-read"];
  const queryParams = qs.stringify({
    response_type: "code",
    client_id,
    scope: scopes.join(" "),
    redirect_uri,
  });
  return `https://accounts.spotify.com/authorize?${queryParams}`;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const tokenRes = await axios.post(
    "https://accounts.spotify.com/api/token",
    qs.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri,
      client_id,
      client_secret,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return tokenRes.data.access_token;
}

export async function fetchTopArtists(token: string): Promise<any[]> {
  const topArtistsRes = await axios.get(
    "https://api.spotify.com/v1/me/top/artists?limit=10",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return topArtistsRes.data.items;
}
