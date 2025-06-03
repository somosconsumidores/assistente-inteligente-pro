
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { productName } = await req.json()

    if (!productName) {
      return new Response(
        JSON.stringify({ error: 'Product name is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const apiKey = Deno.env.get('GOOGLE_CUSTOM_SEARCH_API_KEY')
    const searchEngineId = Deno.env.get('GOOGLE_CUSTOM_SEARCH_ENGINE_ID')

    if (!apiKey || !searchEngineId) {
      console.error('Google Custom Search credentials not found in environment')
      return new Response(
        JSON.stringify({ error: 'Google Custom Search not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Enhanced search query for better product images
    const searchQuery = `${productName} produto oficial imagem fundo branco alta qualidade`
    
    // Build Google Custom Search API URL
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1')
    searchUrl.searchParams.set('key', apiKey)
    searchUrl.searchParams.set('cx', searchEngineId)
    searchUrl.searchParams.set('q', searchQuery)
    searchUrl.searchParams.set('searchType', 'image')
    searchUrl.searchParams.set('num', '5') // Get 5 results for better selection
    searchUrl.searchParams.set('imgSize', 'xlarge')
    searchUrl.searchParams.set('imgType', 'photo')
    searchUrl.searchParams.set('safe', 'active')
    searchUrl.searchParams.set('imgColorType', 'color')
    searchUrl.searchParams.set('fileType', 'jpg,png,jpeg')
    searchUrl.searchParams.set('rights', 'cc_publicdomain,cc_attribute,cc_sharealike,cc_noncommercial,cc_nonderived')

    console.log('Searching for product images:', productName)
    console.log('Search query:', searchQuery)
    console.log('Search URL:', searchUrl.toString())

    const response = await fetch(searchUrl.toString())
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Custom Search API error:', response.status, errorText)
      
      if (response.status === 403) {
        return new Response(
          JSON.stringify({ 
            error: 'Google Custom Search quota exceeded', 
            details: 'Please check your API limits or try again later'
          }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      if (response.status === 400) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid search request', 
            details: errorText
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      throw new Error(`Google API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Google Search API response:', JSON.stringify(data, null, 2))
    
    if (!data.items || data.items.length === 0) {
      console.log('No images found for:', productName)
      
      // Fallback: try a simpler search
      const fallbackQuery = productName.split(' ').slice(0, 3).join(' ') + ' produto'
      const fallbackUrl = new URL('https://www.googleapis.com/customsearch/v1')
      fallbackUrl.searchParams.set('key', apiKey)
      fallbackUrl.searchParams.set('cx', searchEngineId)
      fallbackUrl.searchParams.set('q', fallbackQuery)
      fallbackUrl.searchParams.set('searchType', 'image')
      fallbackUrl.searchParams.set('num', '3')
      fallbackUrl.searchParams.set('imgSize', 'large')
      
      console.log('Trying fallback search:', fallbackQuery)
      
      const fallbackResponse = await fetch(fallbackUrl.toString())
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json()
        if (fallbackData.items && fallbackData.items.length > 0) {
          const bestImage = selectBestImage(fallbackData.items, productName)
          if (bestImage) {
            console.log('Found fallback image:', bestImage.link)
            return new Response(
              JSON.stringify({ 
                imageUrl: bestImage.link,
                source: 'google_fallback',
                title: bestImage.title || productName
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }
      }
      
      // Return fallback Unsplash image if no Google results
      const fallbackImage = generateUnsplashFallback(productName)
      
      return new Response(
        JSON.stringify({ 
          imageUrl: fallbackImage,
          source: 'fallback',
          title: productName
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Select the best image from results
    const bestImage = selectBestImage(data.items, productName)
    
    if (!bestImage) {
      const fallbackImage = generateUnsplashFallback(productName)
      return new Response(
        JSON.stringify({ 
          imageUrl: fallbackImage,
          source: 'fallback',
          title: productName
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const imageUrl = bestImage.link
    
    // Validate that the image URL is accessible
    try {
      const imageResponse = await fetch(imageUrl, { method: 'HEAD' })
      if (!imageResponse.ok) {
        throw new Error('Image not accessible')
      }
    } catch (imageError) {
      console.log('Selected image not accessible, using fallback:', imageError)
      const fallbackImage = generateUnsplashFallback(productName)
      return new Response(
        JSON.stringify({ 
          imageUrl: fallbackImage,
          source: 'fallback',
          title: productName
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Found product image:', imageUrl)

    return new Response(
      JSON.stringify({ 
        imageUrl,
        source: 'google',
        title: bestImage.title || productName,
        dimensions: bestImage.image ? {
          width: bestImage.image.width,
          height: bestImage.image.height
        } : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error searching for product images:', error)
    
    // Return fallback image on any error
    const fallbackImage = generateUnsplashFallback('produto')
    
    return new Response(
      JSON.stringify({ 
        imageUrl: fallbackImage,
        source: 'fallback',
        error: 'Search failed, using fallback image',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function selectBestImage(items: any[], productName: string): any | null {
  if (!items || items.length === 0) return null

  // Score images based on quality indicators
  const scoredImages = items.map(item => {
    let score = 0
    const title = (item.title || '').toLowerCase()
    const displayLink = (item.displayLink || '').toLowerCase()
    const link = (item.link || '').toLowerCase()
    const productLower = productName.toLowerCase()
    
    // Prefer images with product name in title
    if (title.includes(productLower.split(' ')[0])) score += 10
    
    // Prefer e-commerce sites
    if (displayLink.includes('amazon') || displayLink.includes('mercadolivre') || 
        displayLink.includes('magazineluiza') || displayLink.includes('americanas') ||
        displayLink.includes('shopee') || displayLink.includes('aliexpress')) {
      score += 15
    }
    
    // Prefer official or brand sites
    if (displayLink.includes('oficial') || title.includes('oficial')) score += 8
    
    // Prefer standard image formats
    if (link.includes('.jpg') || link.includes('.jpeg') || link.includes('.png')) score += 5
    
    // Prefer larger images
    if (item.image) {
      const width = parseInt(item.image.width) || 0
      const height = parseInt(item.image.height) || 0
      if (width >= 300 && height >= 300) score += 5
      if (width >= 500 && height >= 500) score += 3
    }
    
    // Avoid very small images
    if (item.image) {
      const width = parseInt(item.image.width) || 0
      const height = parseInt(item.image.height) || 0
      if (width < 200 || height < 200) score -= 10
    }
    
    // Avoid certain domains that often have low quality images
    if (displayLink.includes('pinterest') || displayLink.includes('facebook')) score -= 5
    
    return { ...item, score }
  })

  // Sort by score and return the best one
  scoredImages.sort((a, b) => b.score - a.score)
  
  console.log('Image scoring results:', scoredImages.map(img => ({
    link: img.link,
    score: img.score,
    title: img.title?.substring(0, 50)
  })))
  
  return scoredImages[0]
}

function generateUnsplashFallback(productName: string): string {
  // Generate category-specific fallback images from Unsplash
  const productLower = productName.toLowerCase()
  
  if (productLower.includes('notebook') || productLower.includes('laptop')) {
    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop&crop=center'
  } else if (productLower.includes('smartphone') || productLower.includes('celular')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop&crop=center'
  } else if (productLower.includes('tv') || productLower.includes('televisão')) {
    return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop&crop=center'
  } else if (productLower.includes('headphone') || productLower.includes('fone')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&crop=center'
  } else if (productLower.includes('tênis') || productLower.includes('sapato')) {
    return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop&crop=center'
  } else {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center'
  }
}
