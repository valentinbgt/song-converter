import { errorMessages } from "vue/compiler-sfc";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { url } = body;

  if (!url) {
    throw createError({
      statusCode: 400,
      message: "URL is required",
    });
  }

  try {
    const trackName = await getSpotifyTrackName(url);
    console.log(trackName);

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
    //console.log(track);
    return {
      originalUrl: url,
      redirectUrl: track.link,
      title: track.title,
      artist: track.artist.name,
      album: track.album.title,
      cover: track.album.cover_medium,
    };
  } catch (error) {
    console.error("Detailed error:", error);
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error processing URL",
    });
  }
});

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
  return track.name + ' ' + track.artists[0].name + ' ' + track.album.name;
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
