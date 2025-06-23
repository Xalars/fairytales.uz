
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, storyId, storyType } = await req.json();
    
    console.log('Audio generation request:', { storyId, storyType, textLength: text?.length });
    
    if (!text || !storyId || !storyType) {
      throw new Error('Missing required parameters: text, storyId, or storyType');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Generating audio for story:', storyId, storyType);

    // Limit text length to prevent API errors
    const textToSpeak = text.substring(0, 4000);

    // Generate audio using OpenAI TTS
    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: textToSpeak,
        voice: 'alloy',
        response_format: 'mp3'
      }),
    });

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('OpenAI TTS error:', errorText);
      throw new Error(`OpenAI TTS error: ${ttsResponse.status} ${errorText}`);
    }

    // Get audio buffer
    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioFile = new Uint8Array(audioBuffer);

    // Upload to Supabase Storage
    const fileName = `${storyType}_${storyId}_${Date.now()}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('fairytale-audio')
      .upload(fileName, audioFile, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('fairytale-audio')
      .getPublicUrl(fileName);

    const audioUrl = urlData.publicUrl;
    console.log('Audio uploaded successfully:', audioUrl);

    // Update the story table with audio URL
    let tableName = '';
    switch (storyType) {
      case 'folk':
        tableName = 'folk_fairytales';
        break;
      case 'user_generated':
        tableName = 'user_fairytales';
        break;
      case 'ai_generated':
        tableName = 'ai_fairytales';
        break;
      default:
        throw new Error(`Invalid story type: ${storyType}`);
    }

    const { error: updateError } = await supabase
      .from(tableName)
      .update({ audio_url: audioUrl })
      .eq('id', storyId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log('Audio generated and saved successfully for story:', storyId);

    return new Response(
      JSON.stringify({ 
        audioUrl: audioUrl,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-audio function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
