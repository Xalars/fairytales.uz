
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
    const { 
      theme, 
      character, 
      location, 
      moral, 
      language = 'russian', 
      tone = 'magical' 
    } = await req.json();

    if (!theme) {
      throw new Error('Theme is required');
    }

    // Language-specific prompts
    const languageInstructions = {
      'russian': 'Напиши сказку на русском языке. Используй красивый литературный язык, подходящий для детей.',
      'uzbek': 'O\'zbek tilida ertak yozing. Bolalar uchun mos va go\'zal adabiy tildan foydalaning.',
      'english': 'Write a fairy tale in English. Use beautiful literary language suitable for children.'
    };

    const instruction = languageInstructions[language as keyof typeof languageInstructions] || languageInstructions.russian;

    const systemPrompt = `You are a master storyteller who creates magical fairy tales for children. ${instruction}

    Create a wonderful fairy tale that includes:
    - A compelling story with beginning, middle, and end
    - Vivid descriptions that spark imagination
    - Child-friendly language and themes
    - A positive moral lesson
    - Magical elements that delight young readers

    The story should be approximately 300-500 words long and completely appropriate for children aged 3-12.`;

    const userPrompt = `Create a fairy tale with these elements:
    - Theme: ${theme}
    ${character ? `- Main character: ${character}` : ''}
    ${location ? `- Setting: ${location}` : ''}
    ${moral ? `- Moral lesson: ${moral}` : ''}
    - Tone: ${tone}
    - Language: ${language}

    Make it magical, engaging, and memorable for children!`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const fairytaleContent = data.choices[0].message.content;

    // Extract title from the content or generate one
    const lines = fairytaleContent.split('\n').filter(line => line.trim());
    let title = lines[0];
    let content = fairytaleContent;

    // If first line looks like a title, separate it
    if (title && title.length < 100 && !title.includes('.')) {
      content = lines.slice(1).join('\n').trim();
    } else {
      // Generate a title
      const titleResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: `Generate a short, catchy title for this fairy tale in ${language}. Return only the title, nothing else.` 
            },
            { role: 'user', content: content.substring(0, 200) }
          ],
          temperature: 0.7,
          max_tokens: 50,
        }),
      });

      if (titleResponse.ok) {
        const titleData = await titleResponse.json();
        title = titleData.choices[0].message.content.trim();
      } else {
        title = language === 'uzbek' ? 'Sehrli Ertak' : 
               language === 'english' ? 'A Magical Tale' : 'Волшебная сказка';
      }
    }

    return new Response(JSON.stringify({ 
      title: title.replace(/^["']|["']$/g, ''), // Remove quotes if present
      content: content,
      language 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-fairytale function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
