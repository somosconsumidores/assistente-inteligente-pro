
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

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

    const huggingFaceToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')
    if (!huggingFaceToken) {
      console.error('HUGGING_FACE_ACCESS_TOKEN not found in environment')
      return new Response(
        JSON.stringify({ error: 'Hugging Face token not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const hf = new HfInference(huggingFaceToken)

    // Create an enhanced product photography prompt
    const prompt = `Professional product photography of ${productName}, clean white background, studio lighting, high quality, commercial photography, detailed view, 4k resolution, product showcase, professional lighting setup, clean composition`

    console.log('Generating image for product:', productName)
    console.log('Using prompt:', prompt)

    const image = await hf.textToImage({
      inputs: prompt,
      model: 'black-forest-labs/FLUX.1-schnell',
    })

    // Convert the blob to a base64 string
    const arrayBuffer = await image.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const imageUrl = `data:image/png;base64,${base64}`

    console.log('Image generated successfully for:', productName)

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating image:', error)
    
    // Provide more specific error handling
    if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid Hugging Face token', 
          details: 'Please check your HUGGING_FACE_ACCESS_TOKEN configuration'
        }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (error.message?.includes('rate limit') || error.message?.includes('429')) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          details: 'Please wait a moment before generating more images'
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate image', 
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
