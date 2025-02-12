import { defineEventHandler } from "h3";

interface Track {
  preview: string;
}

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);

  const deezerAPIRequest = await $fetch<Track>(
    `https://api.deezer.com/track/${id}`
  );

  const response = await fetch(deezerAPIRequest.preview);
  const audioBuffer = await response.arrayBuffer();

  event.node.res.setHeader("Content-Type", "audio/mpeg");
  event.node.res.setHeader("Content-Length", audioBuffer.byteLength);
  event.node.res.setHeader("Accept-Ranges", "bytes");

  return Buffer.from(audioBuffer);
});
