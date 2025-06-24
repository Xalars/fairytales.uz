import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Star, Sparkles, CheckCircle, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { useFairytales } from "@/hooks/useFairytales";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Publish = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [moderationResult, setModerationResult] = useState<{
    approved: boolean;
    originalContent: string;
    improvedContent: string;
    message: string;
  } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { user, signOut } = useAuth();
  const { addUserFairytale } = useFairytales();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleModeration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Войдите в систему для публикации сказки",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    setModerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('moderate-content', {
        body: {
          title: title.trim(),
          content: content.trim()
        }
      });

      if (error) throw error;

      if (!data.approved) {
        toast({
          title: "Сказка отклонена",
          description: data.message,
          variant: "destructive",
        });
        return;
      }

      setModerationResult(data);
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось проверить сказку",
        variant: "destructive",
      });
    } finally {
      setModerating(false);
    }
  };

  const handlePublish = async () => {
    if (!moderationResult || !user) return;

    setLoading(true);
    try {
      const { error } = await addUserFairytale(
        title.trim(), 
        moderationResult.improvedContent, 
        user.id
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
          description: "Ваша сказка опубликована",
        });
        setTitle("");
        setContent("");
        setModerationResult(null);
        navigate("/library");
      }
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Что-то пошло не так",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/library" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">
              Каталог
            </Link>
            <Link to="/publish" className="text-orange-600 font-bold px-3 py-1 rounded-full border-2 border-orange-300 bg-orange-50">
              Опубликовать сказку
            </Link>
            <Link to="/ai-fairytales" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">
              ИИ-сказки
            </Link>
            {user && (
              <Link to="/profile" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">
                Профиль
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="border-2 border-purple-400 text-purple-700"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex">
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
                <Link to="/auth">
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-6 py-2 font-medium transform hover:scale-105 transition-all"
                  >
                    Зарегистрироваться
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-orange-200 bg-white/95 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 space-y-2">
              <Link to="/library" className="block text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-2 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50 text-center">
                Каталог
              </Link>
              <Link to="/publish" className="block text-orange-600 font-bold px-3 py-2 rounded-full border-2 border-orange-300 bg-orange-50 text-center">
                Опубликовать сказку
              </Link>
              <Link to="/ai-fairytales" className="block text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-2 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50 text-center">
                ИИ-сказки
              </Link>
              {user && (
                <Link to="/profile" className="block text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-2 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50 text-center">
                  Профиль
                </Link>
              )}
              {user ? (
                <Button 
                  onClick={handleSignOut}
                  variant="outline" 
                  className="w-full border-2 border-purple-400 text-purple-700 hover:bg-purple-100 rounded-full px-6 py-2 font-medium"
                >
                  Выйти
                </Button>
              ) : (
                <div className="space-y-2">
                  <Link to="/auth" className="block">
                    <Button 
                      variant="outline" 
                      className="w-full border-2 border-purple-400 text-purple-700 hover:bg-purple-100 rounded-full px-6 py-2 font-medium"
                    >
                      Войти
                    </Button>
                  </Link>
                  <Link to="/auth" className="block">
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-6 py-2 font-medium"
                    >
                      Зарегистрироваться
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-purple-800 mb-4 transform -rotate-1" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Опубликовать сказку ✨
            </h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-orange-200 p-4 mx-4 shadow-lg transform rotate-1">
              <p className="text-xl text-purple-700 font-medium">
                Поделитесь своей волшебной историей с миром!
              </p>
            </div>
          </div>

          {!moderationResult ? (
            <Card className="bg-white/90 backdrop-blur-sm border-4 border-purple-200 rounded-3xl shadow-2xl transform -rotate-1">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-purple-800 text-center flex items-center justify-center gap-3" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  <Sparkles className="w-8 h-8 text-yellow-500" />
                  Создать новую сказку
                  <Sparkles className="w-8 h-8 text-yellow-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleModeration} className="space-y-6">
                  <div>
                    <Label htmlFor="title" className="text-lg font-bold text-purple-700 mb-2 block" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      Название сказки 📖
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="border-4 border-orange-200 rounded-2xl focus:border-orange-400 font-medium text-lg p-4"
                      placeholder="Введите название вашей сказки..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="content" className="text-lg font-bold text-purple-700 mb-2 block" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      Текст сказки 📝
                    </Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="border-4 border-pink-200 rounded-2xl focus:border-pink-400 font-medium text-lg p-4 min-h-[300px]"
                      placeholder="Жили-были..."
                      required
                    />
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button
                      type="submit"
                      disabled={moderating}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full border-4 border-purple-300 shadow-lg transform hover:scale-105 transition-all font-bold text-lg"
                    >
                      {moderating ? "Проверка..." : "Проверить и опубликовать"}
                    </Button>
                    <Link to="/">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-4 border-orange-400 text-orange-700 hover:bg-orange-100 px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all font-bold text-lg"
                      >
                        Отмена
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="bg-white/90 backdrop-blur-sm border-4 border-green-200 rounded-3xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-green-800 text-center flex items-center justify-center gap-3" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    {moderationResult.message}
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                    <h4 className="font-bold text-green-800 mb-3" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      Улучшенная версия:
                    </h4>
                    <div className="whitespace-pre-wrap text-green-800 font-medium leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                      {moderationResult.improvedContent}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 justify-center pt-4">
                    <Button
                      onClick={handlePublish}
                      disabled={loading}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-4 rounded-full border-4 border-green-300 shadow-lg transform hover:scale-105 transition-all font-bold text-lg"
                    >
                      {loading ? "Публикация..." : "Опубликовать"}
                    </Button>
                    <Button
                      onClick={() => setModerationResult(null)}
                      variant="outline"
                      className="border-4 border-purple-400 text-purple-700 hover:bg-purple-100 px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all font-bold text-lg"
                    >
                      Редактировать
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Publish;
