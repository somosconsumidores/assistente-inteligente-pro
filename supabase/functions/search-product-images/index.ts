
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
    const searchQuery = `${productName} product white background commercial photography`
    
    // Build Google Custom Search API URL
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1')
    searchUrl.searchParams.set('key', apiKey)
    searchUrl.searchParams.set('cx', searchEngineId)
    searchUrl.searchParams.set('q', searchQuery)
    searchUrl.searchParams.set('searchType', 'image')
    searchUrl.searchParams.set('num', '3') // Get 3 results to have options
    searchUrl.searchParams.set('imgSize', 'large')
    searchUrl.searchParams.set('imgType', 'photo')
    searchUrl.searchParams.set('safe', 'active')
    searchUrl.searchParams.set('imgColorType', 'color')

    console.log('Searching for product images:', productName)
    console.log('Search query:', searchQuery)

    const response = await fetch(searchUrl.toString())
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Custom Search API error:', response.status, errorText)
      
      if (response.status === 403) {
        return new Response(
          JSON.stringify({ 
            error: 'Google Custom Search quota exceeded', 
            details: 'Please check your API limits'
          }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      throw new Error(`Google API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.items || data.items.length === 0) {
      console.log('No images found for:', productName)
      // Return fallback Unsplash image
      const fallbackImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center'
      
      return new Response(
        JSON.stringify({ 
          imageUrl: fallbackImage,
          source: 'fallback'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Select the best image from results
    const bestImage = data.items.find(item => 
      item.link && 
      (item.link.includes('.jpg') || item.link.includes('.jpeg') || item.link.includes('.png'))
    ) || data.items[0]

    const imageUrl = bestImage.link
    
    console.log('Found product image:', imageUrl)

    return new Response(
      JSON.stringify({ 
        imageUrl,
        source: 'google',
        title: bestImage.title || productName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error searching for product images:', error)
    
    // Return fallback image on any error
    const fallbackImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center'
    
    return new Response(
      JSON.stringify({ 
        imageUrl: fallbackImage,
        source: 'fallback',
        error: 'Search failed, using fallback image'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
