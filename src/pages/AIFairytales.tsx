
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Star, Sparkles, Wand2, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFairytales } from "@/hooks/useFairytales";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AIFairytales = () => {
  const [protagonist, setProtagonist] = useState("");
  const [setting, setSetting] = useState("");
  const [theme, setTheme] = useState("");
  const [length, setLength] = useState("medium");
  const [language, setLanguage] = useState("russian");
  const [loading, setLoading] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<{title: string, content: string, language: string, parameters: any} | null>(null);
  const [saving, setSaving] = useState(false);

  const { user, signOut } = useAuth();
  const { addAIFairytale } = useFairytales();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!protagonist.trim() || !setting.trim() || !theme.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-fairytale', {
        body: {
          protagonist: protagonist.trim(),
          setting: setting.trim(),
          theme: theme.trim(),
          length,
          language
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setGeneratedStory(data);
      toast({
        title: "Успешно!",
        description: "Сказка сгенерирована",
      });
    } catch (err) {
      console.error('Generation error:', err);
      toast({
        title: "Ошибка",
        description: err instanceof Error ? err.message : "Не удалось сгенерировать сказку",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedStory) return;

    setSaving(true);
    try {
      const { error } = await addAIFairytale(
        generatedStory.title, 
        generatedStory.content, 
        generatedStory.parameters,
        generatedStory.language
      );
      
      if (error) {
        toast({
          title: "Ошибка",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Успешно!",
          description: "Сказка сохранена в каталог",
        });
        // Reset form
        setGeneratedStory(null);
        setProtagonist("");
        setSetting("");
        setTheme("");
      }
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить сказку",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 opacity-20">
        <div className="w-20 h-12 bg-white rounded-full"></div>
        <div className="w-16 h-10 bg-white rounded-full -mt-6 ml-4"></div>
      </div>
      <div className="absolute top-20 right-20 opacity-30">
        <Star className="w-8 h-8 text-yellow-400 fill-current" />
      </div>

      {/* Header */}
      <header className="border-b-4 border-orange-200 bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <BookOpen className="h-10 w-10 text-purple-600 transform rotate-12" />
              <Star className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 fill-current" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-purple-700" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                fAIrytales.uz
              </h1>
              <p className="text-sm text-purple-500 italic">Узбекские сказки с ИИ</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/library" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">Каталог</Link>
            <Link to="/publish" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">Опубликовать сказку</Link>
            <Link to="/ai-fairytales" className="text-orange-600 font-bold px-3 py-1 rounded-full border-2 border-orange-300 bg-orange-50">ИИ-сказки</Link>
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-purple-800 mb-4 transform -rotate-1" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              ИИ-сказки ✨
            </h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-orange-200 p-4 mx-4 shadow-lg transform rotate-1">
              <p className="text-xl text-purple-700 font-medium">
                Создайте уникальную сказку с помощью искусственного интеллекта!
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Generation Form */}
            <Card className="bg-white/90 backdrop-blur-sm border-4 border-purple-200 rounded-3xl shadow-2xl transform -rotate-1">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-purple-800 text-center flex items-center justify-center gap-3" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  <Wand2 className="w-8 h-8 text-yellow-500" />
                  Создать сказку
                  <Sparkles className="w-8 h-8 text-yellow-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-6">
                  <div>
                    <Label htmlFor="protagonist" className="text-lg font-bold text-purple-700 mb-2 block" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      Главный герой 👤
                    </Label>
                    <Input
                      id="protagonist"
                      value={protagonist}
                      onChange={(e) => setProtagonist(e.target.value)}
                      className="border-4 border-orange-200 rounded-2xl focus:border-orange-400 font-medium text-lg p-4"
                      placeholder="Например: мудрый старик, храбрая принцесса..."
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="setting" className="text-lg font-bold text-purple-700 mb-2 block" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      Место действия 🏰
                    </Label>
                    <Input
                      id="setting"
                      value={setting}
                      onChange={(e) => setSetting(e.target.value)}
                      className="border-4 border-pink-200 rounded-2xl focus:border-pink-400 font-medium text-lg p-4"
                      placeholder="Например: волшебный лес, древний город..."
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="theme" className="text-lg font-bold text-purple-700 mb-2 block" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      Тема сказки 💡
                    </Label>
                    <Input
                      id="theme"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="border-4 border-green-200 rounded-2xl focus:border-green-400 font-medium text-lg p-4"
                      placeholder="Например: дружба, справедливость, мудрость..."
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-lg font-bold text-purple-700 mb-2 block" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                        Длина 📏
                      </Label>
                      <Select value={length} onValueChange={setLength}>
                        <SelectTrigger className="border-4 border-yellow-200 rounded-2xl focus:border-yellow-400 font-medium text-lg p-4">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Короткая</SelectItem>
                          <SelectItem value="medium">Средняя</SelectItem>
                          <SelectItem value="long">Длинная</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-lg font-bold text-purple-700 mb-2 block" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                        Язык 🌍
                      </Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="border-4 border-blue-200 rounded-2xl focus:border-blue-400 font-medium text-lg p-4">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="russian">Русский</SelectItem>
                          <SelectItem value="uzbek">O'zbek</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full border-4 border-purple-300 shadow-lg transform hover:scale-105 transition-all font-bold text-lg"
                  >
                    {loading ? "Генерирую..." : "Сгенерировать сказку"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Generated Story Display */}
            {generatedStory && (
              <Card className="bg-white/90 backdrop-blur-sm border-4 border-green-200 rounded-3xl shadow-2xl transform rotate-1">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-green-800 text-center flex items-center justify-center gap-3" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    <BookOpen className="w-6 h-6 text-green-600" />
                    {generatedStory.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      value={generatedStory.content}
                      readOnly
                      className="border-4 border-green-200 rounded-2xl font-medium text-base p-4 min-h-[300px] resize-none"
                    />
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-full border-4 border-green-300 shadow-lg transform hover:scale-105 transition-all font-bold"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Сохраняю..." : "Сохранить сказку"}
                      </Button>
                      <Button
                        onClick={() => setGeneratedStory(null)}
                        variant="outline"
                        className="border-4 border-gray-400 text-gray-700 hover:bg-gray-100 px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all font-bold"
                      >
                        Закрыть
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFairytales;
