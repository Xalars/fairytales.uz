
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

    // Create language-specific prompts
    let prompt = '';
    let systemPrompt = '';
    
    if (language === 'uzbek') {
      systemPrompt = 'Siz o\'zbek xalq ertaklarini yaratuvchi ustasiz. O\'zbek madaniyati va an\'analariga mos keladigan go\'zal, ibratli ertaklar yarating.';
      const lengthInstruction = {
        short: 'qisqa (300-500 so\'z)',
        medium: 'o\'rtacha (500-800 so\'z)',
        long: 'uzun (800-1200 so\'z)'
      }[length] || 'o\'rtacha';
      
      prompt = `${lengthInstruction} ertak yozing o\'zbek tilida:
      
Bosh qahramon: ${protagonist}
Voqea joyi: ${setting}
Mavzu: ${theme}

Ertak o\'zbek xalq og\'zaki ijodi an\'analarida bo\'lishi kerak, sehr va tilsim elementlari bilan. Ibrat yoki ta\'limiy jihat qo\'shing. Bolalar va kattalar uchun qiziqarli qiling.

"Bir bor ekan, bir yo\'q ekan..." bilan boshlang va an\'anaviy tugash bilan yakunlang.`;
    } else if (language === 'english') {
      systemPrompt = 'You are a master storyteller specializing in Uzbek folklore adapted for English speakers. Create beautiful, educational fairy tales with elements of traditional Uzbek culture.';
      const lengthInstruction = {
        short: 'short (300-500 words)',
        medium: 'medium (500-800 words)',
        long: 'long (800-1200 words)'
      }[length] || 'medium';
      
      prompt = `Write a ${lengthInstruction} fairy tale in English:
      
Main character: ${protagonist}
Setting: ${setting}
Theme: ${theme}

The fairy tale should be in the traditions of Uzbek folklore, with elements of magic and wonder. Include a moral or educational element. Make the story engaging for both children and adults.

Start with a traditional opening like "Once upon a time..." and end with a traditional conclusion.`;
    } else {
      // Default to Russian
      systemPrompt = 'Ты - мастер сказочник, специализирующийся на узбекском фольклоре. Твоя задача - создавать красивые, поучительные сказки с элементами традиционной узбекской культуры.';
      const lengthInstruction = {
        short: 'короткую (300-500 слов)',
        medium: 'среднюю (500-800 слов)',
        long: 'длинную (800-1200 слов)'
      }[length] || 'среднюю';
      
      prompt = `Напиши ${lengthInstruction} сказку на русском языке со следующими параметрами:
      
Главный герой: ${protagonist}
Место действия: ${setting}
Тема: ${theme}

Сказка должна быть в традициях узбекского фольклора, с элементами магии и волшебства. Включи мораль или поучительный элемент. Сделай историю увлекательной для детей и взрослых.

Начни с традиционного зачина "Жили-были..." и закончи традиционной концовкой.`;
    }

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

    // Generate a title in the same language
    let titlePrompt = '';
    let titleSystemPrompt = '';
    
    if (language === 'uzbek') {
      titleSystemPrompt = 'Ertak uchun qisqa, esda qoladigan nom yarating. Nom ertak bilan bir xil tilda bo\'lishi kerak.';
      titlePrompt = `Ushbu ertak uchun nom yarating:\n\n${generatedStory.substring(0, 500)}...`;
    } else if (language === 'english') {
      titleSystemPrompt = 'Create a short, memorable title for the fairy tale. The title should be in the same language as the fairy tale.';
      titlePrompt = `Create a title for this fairy tale:\n\n${generatedStory.substring(0, 500)}...`;
    } else {
      titleSystemPrompt = 'Создай короткое, запоминающееся название для сказки. Название должно быть на том же языке, что и сказка.';
      titlePrompt = `Создай название для этой сказки:\n\n${generatedStory.substring(0, 500)}...`;
    }

    const titleResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: titleSystemPrompt },
          { role: 'user', content: titlePrompt }
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
      language: language,
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
