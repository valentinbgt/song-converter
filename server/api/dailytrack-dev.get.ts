import { mkdir, readFile, writeFile } from "fs/promises";
import { useUnshortenURL } from "~/composables/useUnshortenURL";
import { prisma } from "~/server/utils/prisma";

const { unshortUrl } = useUnshortenURL();

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

// Helper to convert BigInt fields to Number for JSON serialization
function serializeTrack(track: any) {
  return {
    ...track,
    id: Number(track.id),
  };
}

export default defineEventHandler(async () => {
  //push mock data to test the database for development

  //[END] push mock data to test the database for development

  //curent date yyyy-mm-dd format
  const currentDate = new Date().toISOString().split("T")[0];

  //delete mock data
  await prisma.dailyTracks.deleteMany({
    where: {
      id: BigInt(2163366937),
    },
  });

  /*   await prisma.dailyTracks.create({
    data: {
      id: BigInt(12345678),
      displayDate: new Date("2025-11-29"),
      title: "Mock Track Title",
      artist: "Mock Artist Name",
      album: "Mock Album Title",
      url: "https://www.deezer.com/track/12345678",
      cover: "https://api.deezer.com/cover/12345678.jpg", //mock cover url
    },
  }); */

  const todayTrack = await prisma.dailyTracks.findUnique({
    where: {
      displayDate: new Date(currentDate),
    },
  });

  //if a track is found for today, return it
  if (todayTrack) {
    return serializeTrack(todayTrack);
  }

  //get all ids of tracks already in the database
  const existingTracks = await prisma.dailyTracks.findMany({
    select: {
      id: true,
    },
  });
  // Convert BigInt to Number for comparison
  const existingTrackIds = existingTracks.map((track) => Number(track.id));

  try {
    const PLAYLIST_URL = process.env.DEEZER_DAILY_TRACK_PLAYLIST;
    if (!PLAYLIST_URL) {
      throw new Error(
        "DEEZER_DAILY_TRACK_PLAYLIST environment variable is not set"
      );
    }

    const unshortenedURL = await unshortUrl(PLAYLIST_URL);
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

    //filter out tracks that are already in the database
    const newTracks = playlistTracks.filter(
      (track) => !existingTrackIds.includes(track.id)
    );

    //select a random track from the new tracks
    const selectedTrack =
      newTracks[Math.floor(Math.random() * newTracks.length)];

    if (!selectedTrack) {
      throw new Error("No new tracks available in the playlist.");
    }

    const newTrack = {
      id: BigInt(selectedTrack.id),
      displayDate: new Date(currentDate),
      title: selectedTrack.title,
      artist: selectedTrack.artist.name,
      album: selectedTrack.album.title,
      url: selectedTrack.link,
      cover: selectedTrack.album.cover_medium,
    };

    //store the selected track in the database
    await prisma.dailyTracks.create({
      data: newTrack,
    });

    return serializeTrack(newTrack);
  } catch (error) {
    console.error("Error in dailytrack.get.ts:", error);
    throw error;
  }
});
