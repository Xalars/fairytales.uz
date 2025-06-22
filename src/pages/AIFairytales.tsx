import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, BookOpen, Sparkles, Save, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFairytales } from "@/hooks/useFairytales";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AIFairytales = () => {
  const { user, signOut } = useAuth();
  const { addAIFairytale } = useFairytales();
  const { toast } = useToast();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedFairytale, setGeneratedFairytale] = useState<{
    title: string;
    content: string;
    language: string;
  } | null>(null);

  // Form state
  const [theme, setTheme] = useState('');
  const [character, setCharacter] = useState('');
  const [location, setLocation] = useState('');
  const [moral, setMoral] = useState('');
  const [language, setLanguage] = useState('russian');
  const [tone, setTone] = useState('magical');

  const handleGenerate = async () => {
    if (!theme.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, укажите тему сказки",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-fairytale', {
        body: {
          theme: theme.trim(),
          character: character.trim(),
          location: location.trim(),
          moral: moral.trim(),
          language,
          tone
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedFairytale({
        title: data.title,
        content: data.content,
        language: data.language || language
      });

      toast({
        title: "Успех!",
        description: "Сказка успешно сгенерирована",
      });

    } catch (err) {
      console.error('Generation error:', err);
      toast({
        title: "Ошибка",
        description: err instanceof Error ? err.message : "Ошибка при генерации сказки",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedFairytale || !user) {
      toast({
        title: "Ошибка",
        description: "Нет сказки для сохранения или пользователь не авторизован",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const result = await addAIFairytale(
        generatedFairytale.title,
        generatedFairytale.content,
        {
          theme,
          character,
          location,
          moral,
          tone,
          generated_by: user.id
        },
        generatedFairytale.language
      );

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Успех!",
        description: "Сказка успешно сохранена",
      });

      // Reset form
      setGeneratedFairytale(null);
      setTheme('');
      setCharacter('');
      setLocation('');
      setMoral('');

    } catch (err) {
      console.error('Save error:', err);
      toast({
        title: "Ошибка",
        description: err instanceof Error ? err.message : "Ошибка при сохранении сказки",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100">
      {/* Header */}
      <header className="border-b-4 border-orange-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <BookOpen className="h-10 w-10 text-purple-600 transform rotate-12" />
            <div>
              <h1 className="text-3xl font-bold text-purple-700" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                fAIrytales.uz
              </h1>
              <p className="text-sm text-purple-500 italic">Узбекские сказки с ИИ</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/library" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">
              Каталог
            </Link>
            <Link to="/publish" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">
              Опубликовать сказку
            </Link>
            <Link to="/ai-fairytales" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-orange-300 bg-orange-50">
              ИИ-сказки
            </Link>
          </nav>
          {user ? (
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              className="border-2 border-purple-400 text-purple-700 hover:bg-purple-100 rounded-full px-6 py-2 font-medium transform hover:scale-105 transition-all"
            >
              Выйти
            </Button>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/auth">
                <Button 
                  variant="outline" 
                  className="border-2 border-purple-400 text-purple-700 hover:bg-purple-100 rounded-full px-6 py-2 font-medium transform hover:scale-105 transition-all"
                >
                  Войти
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-6 py-2 font-medium transform hover:scale-105 transition-all"
                >
                  Зарегистрироваться
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold text-purple-800 mb-4 transform -rotate-1" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Генератор Сказок с ИИ ✨
          </h2>
          <div className="w-32 h-2 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mx-auto"></div>
        </div>

        {!user ? (
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-orange-200 p-8 shadow-lg max-w-md mx-auto">
              <Wand2 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-purple-700 font-medium text-lg mb-4">
                Войдите в систему, чтобы создавать сказки с ИИ
              </p>
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full border-4 border-purple-300 shadow-lg transform hover:scale-105 transition-all font-bold">
                  Войти
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Generation Form */}
            <Card className="bg-white/90 backdrop-blur-sm border-4 border-purple-200 rounded-3xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-purple-700 flex items-center" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  <Wand2 className="w-6 h-6 mr-2" />
                  Создайте свою сказку
                </CardTitle>
                <CardDescription className="text-purple-600 font-medium">
                  Заполните поля ниже, и ИИ создаст для вас уникальную сказку
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-purple-700 font-bold">Тема сказки *</label>
                  <Input
                    placeholder="Например: дружба, храбрость, доброта..."
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="border-2 border-purple-300 rounded-full py-3 focus:border-orange-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-purple-700 font-bold">Главный герой</label>
                  <Input
                    placeholder="Например: маленькая принцесса, мудрый дракон..."
                    value={character}
                    onChange={(e) => setCharacter(e.target.value)}
                    className="border-2 border-purple-300 rounded-full py-3 focus:border-orange-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-purple-700 font-bold">Место действия</label>
                  <Input
                    placeholder="Например: волшебный лес, далекое королевство..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="border-2 border-purple-300 rounded-full py-3 focus:border-orange-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-purple-700 font-bold">Мораль сказки</label>
                  <Textarea
                    placeholder="Чему должна научить эта сказка?"
                    value={moral}
                    onChange={(e) => setMoral(e.target.value)}
                    className="border-2 border-purple-300 rounded-2xl focus:border-orange-400"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-purple-700 font-bold">Язык</label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="border-2 border-purple-300 rounded-full focus:border-orange-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="russian">Русский</SelectItem>
                        <SelectItem value="uzbek">O'zbek</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-purple-700 font-bold">Стиль</label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className="border-2 border-purple-300 rounded-full focus:border-orange-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="magical">Волшебный</SelectItem>
                        <SelectItem value="adventurous">Приключенческий</SelectItem>
                        <SelectItem value="gentle">Нежный</SelectItem>
                        <SelectItem value="funny">Веселый</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !theme.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-full border-4 border-purple-300 shadow-lg transform hover:scale-105 transition-all font-bold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Создаем сказку...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Создать сказку
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Fairytale Display */}
            <Card className="bg-white/90 backdrop-blur-sm border-4 border-orange-200 rounded-3xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-orange-700 flex items-center" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  <BookOpen className="w-6 h-6 mr-2" />
                  Ваша сказка
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedFairytale ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-purple-700 mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                        {generatedFairytale.title}
                      </h3>
                      <Badge variant="outline" className="border-2 border-green-300 text-green-700 rounded-full font-medium mb-4">
                        Язык: {generatedFairytale.language === 'russian' ? 'Русский' : 
                               generatedFairytale.language === 'uzbek' ? "O'zbek" : 'English'}
                      </Badge>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border-2 border-purple-200 max-h-96 overflow-y-auto">
                      <p className="text-purple-700 whitespace-pre-wrap leading-relaxed">
                        {generatedFairytale.content}
                      </p>
                    </div>

                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-full border-4 border-green-300 shadow-lg transform hover:scale-105 transition-all font-bold"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Сохраняем...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Сохранить сказку
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Wand2 className="w-16 h-16 text-orange-400 mx-auto mb-4 opacity-50" />
                    <p className="text-orange-600 font-medium">
                      Заполните форму слева и нажмите "Создать сказку"
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIFairytales;
