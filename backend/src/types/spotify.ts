export interface Artist {
  id: string;
  name: string;
  genres: string[];
}

export type FollowedArtist = {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  images: {
    url: string;
    height: number | null;
    width: number | null;
  }[];
  external_urls: {
    spotify: string;
  };
  followers: {
    total: number;
  };
  type: "artist";
  uri: string;
};

export type FollowedArtistsPage = {
  artists: {
    items: FollowedArtist[];
    next: string | null;
    cursors: {
      after: string | null;
    };
    total: number;
    limit: number;
    href: string;
  };
};

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token?: string;
  scope: string;
}
