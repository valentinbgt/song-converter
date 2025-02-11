import { mkdir, readFile, writeFile } from "fs/promises";

interface Track {
  url: string;
  redirectUrl: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
}

export default defineEventHandler(async (event) => {
  const trackUrl =
    "https://open.spotify.com/intl-fr/track/6xjG4EZM1rTMFJeGRNE5hz";

  const tracksDataPath = "data/dailytracks.json";

  //create data directory if it doesn't exist
  await mkdir("data").catch(() => {});

  //read file or create empty array if file doesn't exist
  const tracksData = await readFile(tracksDataPath, "utf-8").catch(() => "[]");
  const tracks: Track[] = JSON.parse(tracksData);

  //if the track is already in the database, return the track, else get the data from the api then save it to the database and return the track
  const track = tracks.find((track: Track) => track.url === trackUrl);
  if (track) {
    return track;
  }

  const newTrack = await getTrackData(trackUrl, "deezer");
  tracks.push(newTrack);
  await writeFile(tracksDataPath, JSON.stringify(tracks, null, 2));

  return newTrack;
});

async function getTrackData(
  trackUrl: string,
  targetPlatform: string
): Promise<Track> {
  const data = await $fetch<Track>("/api/convert", {
    method: "POST",
    body: {
      url: trackUrl,
      targetPlatform: targetPlatform,
    },
  });
  return { ...data, url: trackUrl };
}
