export default defineEventHandler(async (event) => {
  //get url from query params
  const url = getQuery(event).url as string;
  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing 'url' query parameter",
    });
  }

  //decode url to handle encoded URLs
  const decodedUrl = decodeURIComponent(url);

  try {
    //make a HEAD request to the URL to follow redirects
    const response = await fetch(decodedUrl, {
      method: "HEAD",
      redirect: "follow",
    });

    //return the final URL after redirects
    return {
      originalUrl: decodedUrl,
      finalUrl: response.url,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to unshorten URL",
    });
  }
});
