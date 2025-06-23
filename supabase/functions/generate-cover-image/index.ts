
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, content, storyId, storyType } = await req.json()

    if (!title || !storyId || !storyType) {
      throw new Error('Title, storyId, and storyType are required')
    }

    // Create a fairy-tale style prompt based on the title and content
    const prompt = `A beautiful hand-drawn fairy tale illustration in the style of children's book art, depicting: ${title}. The image should be colorful, magical, and suitable for children, with Uzbek cultural elements if relevant. High quality, detailed, artistic style.`

    // Generate image with DALL-E
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url'
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to generate image')
    }

    const imageData = await response.json()
    const imageUrl = imageData.data[0].url

    // Download the image
    const imageResponse = await fetch(imageUrl)
    const imageBlob = await imageResponse.blob()
    const imageBuffer = await imageBlob.arrayBuffer()

    // Upload to Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const fileName = `cover-${storyType}-${storyId}-${Date.now()}.png`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('fairytale-audio')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('fairytale-audio')
      .getPublicUrl(fileName)

    const publicUrl = urlData.publicUrl

    // Update the story record with the cover image URL
    let tableName = ''
    switch (storyType) {
      case 'folk':
        tableName = 'folk_fairytales'
        break
      case 'user_generated':
        tableName = 'user_fairytales'
        break
      case 'ai_generated':
        tableName = 'ai_fairytales'
        break
      default:
        throw new Error('Invalid story type')
    }

    const { error: updateError } = await supabase
      .from(tableName)
      .update({ cover_image_url: publicUrl })
      .eq('id', storyId)

    if (updateError) {
      throw new Error(`Failed to update story: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({ coverImageUrl: publicUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error generating cover image:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
