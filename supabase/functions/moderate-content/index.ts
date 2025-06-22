
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // First, check if content is appropriate
    const moderationResponse = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: content,
      }),
    });

    const moderationData = await moderationResponse.json();
    const isFlagged = moderationData.results[0]?.flagged || false;

    if (isFlagged) {
      return new Response(JSON.stringify({ 
        isAppropriate: false,
        reason: 'Content flagged by moderation system'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If appropriate, improve the content
    const improvementResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Ты редактор детских сказок. Улучши грамматику, стиль и сделай текст более подходящим для детей. Сохрани оригинальную историю и смысл. Если текст уже хорош, верни его без изменений. Отвечай только исправленным текстом без дополнительных комментариев.'
          },
          { role: 'user', content: content }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    const improvementData = await improvementResponse.json();
    const improvedContent = improvementData.choices[0].message.content;

    // Check if content was actually improved
    const wasImproved = improvedContent.length !== content.length || improvedContent !== content;

    return new Response(JSON.stringify({ 
      isAppropriate: true,
      moderatedContent: wasImproved ? improvedContent : null,
      wasImproved
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in moderate-content function:', error);
    return new Response(JSON.stringify({ 
      isAppropriate: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
