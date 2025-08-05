import axios from "axios";
import { AxiosResponse } from "axios";
import { Artist, FollowedArtist, FollowedArtistsPage } from "../types/spotify";

export async function fetchSpotifyProfile(accessToken: string) {
  const res = await axios.get("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
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

export async function fetchFollowedArtists(
  token: string
): Promise<FollowedArtist[]> {
  let artists: FollowedArtist[] = [];
  let after: string | null = null;
  const limit = 50;

  do {
    const res: AxiosResponse<FollowedArtistsPage> = await axios.get(
      "https://api.spotify.com/v1/me/following",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          type: "artist",
          limit,
          ...(after ? { after } : {}),
        },
      }
    );

    const data = res.data.artists;
    artists = artists.concat(data.items);
    after = data.cursors.after;
  } while (after);

  return artists;
}
