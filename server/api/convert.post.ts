import { errorMessages } from "vue/compiler-sfc";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { url, targetPlatform } = body;

  if (!url) {
    throw createError({
      statusCode: 400,
      message: "URL is required",
    });
  }

  if (!targetPlatform) {
    throw createError({
      statusCode: 400,
      message: "Target platform is required",
    });
  }

  try {
    const originPlatform = detectOrgininPlatform(url);

    if (!originPlatform) {
      throw createError({
        statusCode: 400,
        message: "Could not detect origin platform",
      });
    }

    const trackName = await getTrackName(url, originPlatform);
    console.log(trackName);

    //get track info
    const trackInfo = await getTrackInfo(trackName, targetPlatform);
    console.log(trackInfo);

    return {
      originalUrl: url,
      redirectUrl: trackInfo.redirectUrl,
      title: trackInfo.title,
      artist: trackInfo.artist,
      album: trackInfo.album,
      cover: trackInfo.cover,
    };
  } catch (error) {
    console.error("Detailed error:", error);
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error processing URL",
    });
  }
});

function detectOrgininPlatform(url: string) {
  //https://open.spotify.com/track/12345678
  //spotify:track:12345678

  //https://www.deezer.com/track/12345678
  //deezer://track/12345678
  //https://deezer.page.link/ABCDEFGHIJKLMNOPQ

  //https://music.apple.com/us/song/12345678
  //music://song/12345678

  //https://www.youtube.com/watch?v=12345678
  //https://youtu.be/XWMPBarKa5s

  //https://music.youtube.com/watch?v=12345678

  //https://soundcloud.com/[username]/[track-slug]

  //https://tidal.com/browse/track/12345678
  //tidal://track/12345678

  //https://music.amazon.com/tracks/12345678
  //music://track/[track_id]

  //https://app.napster.com/track/12345678

  const platforms = [
    {
      platform: "spotify",
      search: ["spotify", "open.spotify.com", "spotify:track"],
    },
    {
      platform: "deezer-page-link",
      search: ["deezer.page.link"],
    },
    {
      platform: "deezer",
      search: ["deezer", "deezer.com", "deezer://track"],
    },
  ];

  for (const platform of platforms) {
    if (platform.search.some((term) => url.includes(term))) {
      return platform.platform;
    }
  }

  return null;
}

async function getTrackName(url: string, platform: string): Promise<string> {
  if (platform === "spotify") {
    return getSpotifyTrackName(url);
  }

  if (platform === "deezer") {
    return getDeezerTrackName(url);
  }

  if (platform === "deezer-page-link") {
    const realUrl = await unshortenURL(url);
    return getDeezerTrackName(realUrl);
  }

  throw createError({
    statusCode: 500,
    message: "Unsupported platform",
  });
}

async function getTrackInfo(trackName: string, targetPlatform: string) {
  if (targetPlatform === "spotify") {
    return getSpotifyTrackInfo(trackName);
  }

  if (targetPlatform === "deezer") {
    return getDeezerTrackInfo(trackName);
  }

  throw createError({
    statusCode: 500,
    message: "Unsupported platform, asked for " + targetPlatform,
  });
}

async function getSpotifyTrackName(url: string) {
  // Extract track ID from Spotify URL
  const trackId = url.split("/track/")[1]?.split("?")[0];
  if (!trackId) {
    throw new Error("Could not extract track ID");
  }

  const accessToken = await getSpotifyAccessToken();

  // Get track details
  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch track from Spotify: ${error}`);
  }

  const track = await response.json();
  console.log(track);
  return track.name + " " + track.artists[0].name + " " + track.album.name;
}

async function getSpotifyTrackInfo(trackName: string) {
  const accessToken = await getSpotifyAccessToken();

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      trackName
    )}&type=track&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch from Spotify API");
  }

  const data = await response.json();
  if (!data.tracks.items || data.tracks.items.length === 0) {
    throw new Error("No matching track found on Spotify");
  }

  const track = data.tracks.items[0];
  console.log(track.album.images);
  return {
    redirectUrl: track.external_urls.spotify,
    title: track.name,
    artist: track.artists[0].name,
    album: track.album.name,
    cover: track.album.images[1].url,
  };
}

async function getSpotifyAccessToken() {
  const config = useRuntimeConfig();
  const clientId = config.spotifyClientId;
  const clientSecret = config.spotifyClientSecret;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured");
  }

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  if (!tokenResponse.ok) {
    const tokenError = await tokenResponse.text();
    throw new Error(`Failed to get Spotify access token: ${tokenError}`);
  }

  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    throw new Error("No access token received from Spotify");
  }

  return tokenData.access_token;
}

async function getDeezerTrackName(url: string) {
  // Extract track ID from Deezer URL
  const trackId = url.split("/track/")[1]?.split("?")[0];
  if (!trackId) {
    throw new Error("Could not extract track ID");
  }

  const response = await fetch(`https://api.deezer.com/track/${trackId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch track from Deezer");
  }

  const data = await response.json();
  return data.title + " " + data.artist.name + " " + data.album.title;
}

async function getDeezerTrackInfo(trackName: string) {
  const response = await fetch(
    `https://api.deezer.com/search/track/?q=${encodeURIComponent(
      trackName
    )}&index=0&limit=1`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch from Deezer API");
  }

  const data = await response.json();
  if (!data.data || !data.data[0]) {
    throw new Error("No matching track found on Deezer");
  }

  const track = data.data[0];

  return {
    redirectUrl: track.link,
    title: track.title,
    artist: track.artist.name,
    album: track.album.title,
    cover: track.album.cover_medium,
  };
}

async function unshortenURL(url: string) {
  const response = await fetch(url);
  return response.url;
}
