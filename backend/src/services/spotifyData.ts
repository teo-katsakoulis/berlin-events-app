import axios from "axios";

export interface Artist {
  id: string;
  name: string;
  genres: string[];
}

export async function fetchTopArtists(token: string): Promise<Artist[]> {
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

export async function fetchTopTracks(token: string): Promise<any[]> {
  const topArtistsRes = await axios.get(
    "https://api.spotify.com/v1/me/top/tracks?limit=30",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return topArtistsRes.data.items;
}

export async function fetchRelatedArtists(
  token: string,
  artistId: string
): Promise<any[]> {
  const res = await axios.get(
    `https://api.spotify.com/v1/artists/${artistId}/related-artists`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data.artists;
}
