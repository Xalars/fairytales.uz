
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
    const { title, content } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Step 1: Content moderation check
    console.log('Starting content moderation...');
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
            content: `Ты модератор детских сказок. Оцени содержание сказки по следующим критериям:
            1. Подходит ли для детей (нет насилия, жестокости, страшных сцен)
            2. Нет ли неприличного или непристойного контента
            3. Имеет ли смысл (не является ли бессмыслицей, спамом или случайными буквами)
            4. Морально ли подходящая (учит добру, имеет положительное послание)
            
            Ответь только "APPROVED" если сказка проходит все проверки, или "REJECTED" если не проходит хотя бы одну.`
          },
          {
            role: 'user',
            content: `Название: ${title}\n\nСодержание: ${content}`
          }
        ],
        temperature: 0.1,
      }),
    });

    const moderationData = await moderationResponse.json();
    const moderationResult = moderationData.choices[0].message.content.trim();

    console.log('Moderation result:', moderationResult);

    if (moderationResult === 'REJECTED') {
      return new Response(JSON.stringify({ 
        approved: false, 
        message: 'В сказке содержится неподобающий контент' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 2: Grammar and style improvement
    console.log('Starting content improvement...');
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
            content: `Ты редактор детских сказок. Улучши грамматику, стиль и структуру сказки, сохраняя её основной сюжет и смысл. Сделай текст более красивым и литературным, подходящим для детей. Верни улучшенную версию сказки.`
          },
          {
            role: 'user',
            content: `Название: ${title}\n\nСодержание: ${content}`
          }
        ],
        temperature: 0.3,
      }),
    });

    const improvementData = await improvementResponse.json();
    const improvedContent = improvementData.choices[0].message.content.trim();

    console.log('Content improved successfully');

    return new Response(JSON.stringify({ 
      approved: true,
      originalContent: content,
      improvedContent: improvedContent,
      message: 'Мы немного улучшили сказку. Как вам?'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in moderate-content function:', error);
    return new Response(JSON.stringify({ 
      error: 'Ошибка при модерации контента',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
