import { mkdir, readFile, writeFile } from "fs/promises";

interface Track {
  id: number;
  used: boolean;
  timestamp: number;
  readable: boolean;
  title: string;
  title_short: string;
  title_version: string;
  isrc: string;
  link: string;
  duration: number;
  rank: number;
  explicit_lyrics: boolean;
  explicit_content_lyrics: number;
  explicit_content_cover: number;
  preview: string;
  md5_image: string;
  time_add: number;
  artist: {
    id: number;
    name: string;
    link: string;
    tracklist: string;
    type: string;
  };
  album: {
    id: number;
    title: string;
    upc: string;
    cover: string;
    cover_small: string;
    cover_medium: string;
    cover_big: string;
    cover_xl: string;
    md5_image: string;
    tracklist: string;
    type: string;
  };
  type: string;
}

interface Playlist {
  id: number;
  tracks: {
    data: Track[];
  };
}

export default defineEventHandler(async () => {
  try {
    const PLAYLIST_URL = process.env.DEEZER_DAILY_TRACK_PLAYLIST;
    if (!PLAYLIST_URL) {
      throw new Error(
        "DEEZER_DAILY_TRACK_PLAYLIST environment variable is not set"
      );
    }
    const TRACKS_DATA_PATH = "data/dailytracks.json";

    async function unshortenURL(url: string): Promise<string> {
      const response = await fetch(url, { redirect: "manual" });
      const location = response.headers.get("location");
      return location ? location : url;
    }

    const unshortenedURL = await unshortenURL(PLAYLIST_URL);
    const playlistIdMatch = unshortenedURL.match(/playlist\/(\d+)/);
    if (!playlistIdMatch) {
      throw new Error("Invalid playlist URL format.");
    }
    const playlistId = playlistIdMatch[1];

    //fetch playlist data from Deezer API
    const playlistResponse = await $fetch<Playlist>(
      `https://api.deezer.com/playlist/${playlistId}`
    );

    if (
      !playlistResponse.tracks.data ||
      playlistResponse.tracks.data.length === 0
    ) {
      throw new Error("No tracks found in the playlist.");
    }

    const playlistTracks = playlistResponse.tracks.data;

    //ensure the data directory exists
    await mkdir("data", { recursive: true });

    //read existing tracks from the JSON file or initialize an empty array
    let tracks: Track[] = [];
    try {
      const tracksData = await readFile(TRACKS_DATA_PATH, "utf-8");
      tracks = tracksData.trim() === "" ? [] : JSON.parse(tracksData);
    } catch {
      //if the file doesn't exist, start with an empty array
      tracks = [];
    }

    //delete (filter out) tracks that are in the database but not in the fetched playlist.
    const playlistTrackIds = new Set(playlistTracks.map((track) => track.id));
    tracks = tracks.filter((track) => playlistTrackIds.has(track.id));

    //add new tracks from the playlist to the database
    playlistTracks.forEach((newTrack) => {
      if (!tracks.some((track) => track.id === newTrack.id)) {
        tracks.push({
          ...newTrack,
          used: false,
          timestamp: 0,
        });
      }
    });

    const now = Date.now();

    //mark tracks as unused if from a previous day
    tracks.forEach((track) => {
      if (track.timestamp > 0 && isNewDay(track.timestamp, now)) {
        track.used = false;
        track.timestamp = 0;
      }
    });

    //identify the current active track (must be from the same day)
    const activeTrack = tracks.find(
      (track) =>
        track.used === false &&
        track.timestamp > 0 &&
        !isNewDay(track.timestamp, now)
    );

    if (activeTrack) {
      //persist any updates if necessary
      await writeFile(TRACKS_DATA_PATH, JSON.stringify(tracks, null, 2));
      return returnTrack(activeTrack);
    }

    //filter out tracks that have been used
    const availableTracks = tracks.filter(
      (track) => !track.used && track.timestamp === 0
    );

    if (availableTracks.length === 0) {
      //persist deletion modifications before returning
      await writeFile(TRACKS_DATA_PATH, JSON.stringify(tracks, null, 2));
      const mostRecent = [...tracks].sort(
        (a, b) => b.timestamp - a.timestamp
      )[0];
      return returnTrack(mostRecent);
    }

    //select a random track from the available tracks
    const selectedTrack =
      availableTracks[Math.floor(Math.random() * availableTracks.length)];

    //update the selected track's timestamp to mark it as active
    selectedTrack.timestamp = now;

    //persist the updated tracks back to the JSON file
    await writeFile(TRACKS_DATA_PATH, JSON.stringify(tracks, null, 2));

    return returnTrack(selectedTrack);
  } catch (error) {
    console.error("Error in dailytrack.get.ts:", error);
    throw error;
  }
});

async function returnTrack(track: Track): Promise<{ [key: string]: any }> {
  let response: { [key: string]: any } = {
    deezer: {
      redirectUrl: track.link,
      title: track.title,
      artist: track.artist.name,
      album: track.album.title,
      cover: track.album.cover_medium,
      url: track.link,
      id: track.id,
      deezerId: track.id,
    },
    spotify: {},
    applemusic: {},
    youtube: {},
    youtubemusic: {},
    soundcloud: {},
    tidal: {},
    amazonmusic: {},
    napster: {},
    originalUrl: track.link,
  };

  return response;
}

// Helper function to check if two timestamps are on different days
function isNewDay(timestamp1: number, timestamp2: number): boolean {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  return date1.toDateString() !== date2.toDateString();
}
