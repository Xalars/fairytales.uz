
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    
    if (!content) {
      throw new Error('Content is required for moderation');
    }

    // First check: Content moderation
    const moderationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are a strict content moderator for children's fairy tales. Analyze the following story and determine if it's appropriate for children aged 3-12. 

            REJECT if the story contains:
            - Any violence, death, or scary content
            - Inappropriate language or adult themes
            - Nonsensical or incoherent content
            - Morally questionable messages
            - Any content not suitable for young children

            ACCEPT only if the story is:
            - Child-friendly and educational
            - Coherent and well-structured
            - Morally positive
            - Age-appropriate for young children

            Respond with ONLY "APPROVED" or "REJECTED" followed by a brief reason.`
          },
          {
            role: 'user',
            content: content
          }
        ],
      }),
    });

    const moderationData = await moderationResponse.json();
    const moderationResult = moderationData.choices[0].message.content;
    
    const isApproved = moderationResult.startsWith('APPROVED');
    
    if (!isApproved) {
      return new Response(JSON.stringify({ 
        isAppropriate: false, 
        reason: 'В сказке содержится неподобающий контент',
        moderatedContent: null 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Second step: Grammar and style improvement
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
            content: `You are an expert editor for children's fairy tales. Improve the following story by:
            - Correcting grammar and spelling errors
            - Enhancing the narrative style to make it more engaging for children
            - Making the language more vivid and child-friendly
            - Ensuring the story flows well and is easy to read
            - Keeping the original plot and meaning intact
            
            Return only the improved story text, nothing else.`
          },
          {
            role: 'user',
            content: content
          }
        ],
      }),
    });

    const improvementData = await improvementResponse.json();
    const improvedContent = improvementData.choices[0].message.content;

    return new Response(JSON.stringify({ 
      isAppropriate: true, 
      moderatedContent: improvedContent,
      message: 'Мы немного улучшили сказку. Как вам?'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in moderate-content function:', error);
    return new Response(JSON.stringify({ 
      isAppropriate: false, 
      error: 'Ошибка при проверке содержания' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
