
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

    // Create enhanced prompts based on story type and content
    let basePrompt = ''
    
    if (storyType === 'folk') {
      basePrompt = `A traditional Uzbek folk tale illustration depicting: ${title}. Traditional Central Asian art style with rich colors, ornate patterns, and cultural elements like traditional clothing, architecture, and landscapes. Hand-drawn fairy tale book illustration style.`
    } else if (storyType === 'ai_generated') {
      basePrompt = `A magical fairy tale illustration for the story: ${title}. Modern children's book art style with vibrant colors, whimsical characters, and enchanting scenes. Include elements that reflect the story's magical nature.`
    } else {
      basePrompt = `A beautiful children's book illustration for: ${title}. Warm, inviting art style suitable for young readers, with bright colors and engaging characters.`
    }

    // Add content context if available
    const contentContext = content ? ` The story involves: ${content.substring(0, 200)}...` : ''
    const fullPrompt = basePrompt + contentContext + ' High quality, detailed, artistic illustration perfect for a book cover.'

    // Generate image with DALL-E
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: fullPrompt,
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

    // Upload to Supabase Storage (fairytale-covers bucket)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const fileName = `cover-${storyType}-${storyId}-${Date.now()}.png`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('fairytale-covers')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('fairytale-covers')
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
