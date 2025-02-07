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
    return {
      originalUrl: url,
      shortUrl: `https://your-domain.com/${Math.random().toString(36).substr(2, 6)}`
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Error processing URL'
    })
  }
}) 