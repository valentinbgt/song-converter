export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { url } = body

  if (!url) {
    throw createError({
      statusCode: 400,
      message: 'URL is required'
    })
  }

  try {
    //call deezer API https://api.deezer.com/search/track/?q=eminem&index=0&limit=1
    //const response = await fetch(`https://api.deezer.com/search/track/?q=${url}&index=0&limit=1`)
    const response = await fetch(`https://api.deezer.com/search/track/?q=eminem&index=0&limit=1`)
    const data = await response.json()
    const track = data.data[0]
    return {
      originalUrl: url,
      redirectUrl: track.link
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Error processing URL'
    })
  }
}) 