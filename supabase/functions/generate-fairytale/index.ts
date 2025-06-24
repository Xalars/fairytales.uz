
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to clean markdown formatting
const cleanMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
    .replace(/__(.*?)__/g, '$1') // Remove underline markdown
    .replace(/_(.*?)_/g, '$1') // Remove italic underline markdown
    .replace(/`(.*?)`/g, '$1') // Remove code markdown
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/^\s*[-*+]\s/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s/gm, '') // Remove numbered list markers
    .trim();
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { protagonist, setting, theme, length, language } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Language mapping for proper prompts
    const languagePrompts = {
      russian: {
        systemPrompt: "Ты талантливый рассказчик узбекских народных сказок. Создай волшебную, добрую сказку на русском языке в стиле узбекского фольклора. НЕ ИСПОЛЬЗУЙ никакой markdown разметки (**, __, *, _). Пиши простым текстом без форматирования.",
        lengthMap: {
          short: "короткую (1-2 минуты чтения)",
          medium: "среднюю (3-5 минут чтения)", 
          long: "длинную (5-10 минут чтения)"
        }
      },
      uzbek: {
        systemPrompt: "Sen o'zbek xalq ertaklarining mohir hikoyachisissan. O'zbek folklori uslubida, uzbek tilida sehrli va mehribon ertak yarating. HECH QANDAY markdown formatlashdan foydalanmang (**, __, *, _). Oddiy matn bilan yozing.",
        lengthMap: {
          short: "qisqa (1-2 daqiqa o'qish)",
          medium: "o'rta (3-5 daqiqa o'qish)",
          long: "uzun (5-10 daqiqa o'qish)"
        }
      },
      english: {
        systemPrompt: "You are a talented storyteller of Uzbek folk tales. Create a magical, kind fairy tale in English in the style of Uzbek folklore. DO NOT use any markdown formatting (**, __, *, _). Write in plain text without formatting.",
        lengthMap: {
          short: "short (1-2 minutes reading)",
          medium: "medium (3-5 minutes reading)",
          long: "long (5-10 minutes reading)"
        }
      }
    };

    const selectedLanguage = languagePrompts[language] || languagePrompts.russian;
    const lengthDescription = selectedLanguage.lengthMap[length] || selectedLanguage.lengthMap.medium;

    let userPrompt = '';
    
    if (language === 'uzbek') {
      userPrompt = `Quyidagi parametrlar bo'yicha ${lengthDescription} ertak yarating:

Bosh qahramon: ${protagonist}
O'rin: ${setting}
Mavzu: ${theme}

Ertakda quyidagilar bo'lishi kerak:
- Uzbek xalq ertaklari uslubi
- Yaxshi va yomon o'rtasidagi kurash
- Axloqiy saboq
- Sehrli elementlar
- Baxtli tugash

Ertakni to'liq uzbek tilida yozing. Avval ertakning nomini bering, keyin to'liq matnini yozing. MARKDOWN formatlashdan foydalanmang.`;
    } else if (language === 'english') {
      userPrompt = `Create a ${lengthDescription} fairy tale with these parameters:

Main character: ${protagonist}
Setting: ${setting}
Theme: ${theme}

The fairy tale should include:
- Uzbek folk tale style
- Struggle between good and evil
- Moral lesson
- Magical elements
- Happy ending

Write the entire fairy tale in English. First provide the title, then the full story. Do NOT use markdown formatting.`;
    } else {
      userPrompt = `Создай ${lengthDescription} сказку с такими параметрами:

Главный герой: ${protagonist}
Место действия: ${setting}
Тема: ${theme}

Сказка должна включать:
- Стиль узбекских народных сказок
- Борьбу добра со злом
- Моральный урок
- Волшебные элементы
- Счастливый конец

Напиши всю сказку на русском языке. Сначала дай название сказки, потом полный текст. НЕ используй markdown разметку.`;
    }

    console.log(`Generating fairy tale in ${language}...`);

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
            content: selectedLanguage.systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: length === 'short' ? 1000 : length === 'medium' ? 2000 : 3000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate fairy tale');
    }

    let generatedText = data.choices[0].message.content;
    
    // Clean any markdown formatting that might have been generated
    generatedText = cleanMarkdown(generatedText);
    
    // Extract title and content
    const lines = generatedText.split('\n').filter(line => line.trim());
    const title = lines[0].replace(/^(Название|Title|Sarlavha):\s*/i, '').replace(/^["«]|["»]$/g, '').trim();
    const content = lines.slice(1).join('\n').trim();

    const parameters = {
      protagonist,
      setting,
      theme,
      length,
      language,
      generatedAt: new Date().toISOString()
    };

    console.log(`Fairy tale generated successfully in ${language}`);

    return new Response(JSON.stringify({
      title: cleanMarkdown(title),
      content: cleanMarkdown(content),
      parameters
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-fairytale function:', error);
    return new Response(JSON.stringify({ 
      error: 'Ошибка при генерации сказки',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
