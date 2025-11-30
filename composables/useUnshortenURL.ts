export function useUnshortenURL() {
  interface UnshortenURLResponse {
    originalUrl: string;
    finalUrl: string;
  }

  async function unshortUrl(shortUrl: string): Promise<string> {
    let encodedUrl = encodeURIComponent(shortUrl);
    try {
      const res = await $fetch<UnshortenURLResponse>("/api/unshort", {
        method: "GET",
        params: {
          url: encodedUrl,
        },
      });
      return res.finalUrl;
    } catch (error) {
      console.error("Error unshortening URL:", error);
      return shortUrl; // Fallback to original URL on error
    }
  }

  return { unshortUrl };
}
