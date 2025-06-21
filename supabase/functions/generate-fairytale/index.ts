
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { protagonist, setting, theme, length, language } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create a detailed prompt based on the parameters
    const lengthInstruction = {
      short: 'короткую (300-500 слов)',
      medium: 'среднюю (500-800 слов)',
      long: 'длинную (800-1200 слов)'
    }[length] || 'среднюю';

    const languageInstruction = {
      russian: 'на русском языке',
      uzbek: 'на узбекском языке',
      english: 'на английском языке'
    }[language] || 'на русском языке';

    const prompt = `Напиши ${lengthInstruction} сказку ${languageInstruction} со следующими параметрами:
    
Главный герой: ${protagonist}
Место действия: ${setting}
Тема: ${theme}

Сказка должна быть в традициях узбекского фольклора, с элементами магии и волшебства. Включи мораль или поучительный элемент. Сделай историю увлекательной для детей и взрослых.

Начни с традиционного зачина "Жили-были..." и закончи традиционной концовкой.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'Ты - мастер сказочник, специализирующийся на узбекском фольклоре. Твоя задача - создавать красивые, поучительные сказки с элементами традиционной узбекской культуры.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedStory = data.choices[0].message.content;

    // Generate a title based on the story content
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
            content: 'Создай короткое, запоминающееся название для сказки. Название должно быть на том же языке, что и сказка.'
          },
          { 
            role: 'user', 
            content: `Создай название для этой сказки:\n\n${generatedStory.substring(0, 500)}...`
          }
        ],
        temperature: 0.7,
        max_tokens: 50,
      }),
    });

    const titleData = await titleResponse.json();
    const generatedTitle = titleData.choices[0].message.content.replace(/['"«»]/g, '');

    return new Response(JSON.stringify({ 
      title: generatedTitle,
      content: generatedStory,
      parameters: {
        protagonist,
        setting,
        theme,
        length,
        language
      }
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
