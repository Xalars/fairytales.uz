import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Send, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFairytales } from "@/hooks/useFairytales";
import { useToast } from "@/hooks/use-toast";

const Publish = () => {
  const { user, signOut } = useAuth();
  const { addUserFairytale } = useFairytales();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderationResult, setModerationResult] = useState<{
    passed: boolean;
    moderatedContent?: string;
    message?: string;
  } | null>(null);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему для публикации",
        variant: "destructive",
      });
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

    setIsSubmitting(true);
    setModerationResult(null);

    try {
      const result = await addUserFairytale(title.trim(), content.trim(), user.id);
      
      if (result.error) {
        if (result.moderationFailed) {
          setModerationResult({
            passed: false,
            message: result.error
          });
        } else {
          throw new Error(result.error);
        }
      } else {
        if (result.wasModerated) {
          setModerationResult({
            passed: true,
            moderatedContent: result.moderatedContent,
            message: result.message || 'Мы немного улучшили сказку. Как вам?'
          });
        } else {
          toast({
            title: "Успех!",
            description: "Сказка успешно опубликована",
          });
          // Reset form
          setTitle('');
          setContent('');
        }
      }

    } catch (err) {
      console.error('Publishing error:', err);
      toast({
        title: "Ошибка",
        description: err instanceof Error ? err.message : "Ошибка при публикации сказки",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalPublish = async () => {
    if (!moderationResult?.moderatedContent || !user) return;

    setIsSubmitting(true);

    try {
      // Save the moderated content directly
      const result = await addUserFairytale(title.trim(), moderationResult.moderatedContent, user.id);
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Успех!",
        description: "Улучшенная сказка успешно опубликована",
      });

      // Reset form
      setTitle('');
      setContent('');
      setModerationResult(null);

    } catch (err) {
      console.error('Final publishing error:', err);
      toast({
        title: "Ошибка",
        description: err instanceof Error ? err.message : "Ошибка при финальной публикации",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
            <Link to="/publish" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-orange-300 bg-orange-50">
              Опубликовать сказку
            </Link>
            <Link to="/ai-fairytales" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">
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
            Опубликовать Сказку ✍️
          </h2>
          <div className="w-32 h-2 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mx-auto"></div>
        </div>

        {!user ? (
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-orange-200 p-8 shadow-lg max-w-md mx-auto">
              <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-purple-700 font-medium text-lg mb-4">
                Войдите в систему, чтобы опубликовать свою сказку
              </p>
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full border-4 border-purple-300 shadow-lg transform hover:scale-105 transition-all font-bold">
                  Войти
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-sm border-4 border-purple-200 rounded-3xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-purple-700 flex items-center" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  <BookOpen className="w-6 h-6 mr-2" />
                  Создайте свою сказку
                </CardTitle>
                <CardDescription className="text-purple-600 font-medium">
                  Поделитесь своей удивительной историей с другими читателями
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-purple-700 font-bold">Название сказки</label>
                  <Input
                    placeholder="Введите название вашей сказки..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                    className="border-2 border-purple-300 rounded-full py-3 focus:border-orange-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-purple-700 font-bold">Текст сказки</label>
                  <Textarea
                    placeholder="Напишите свою удивительную сказку здесь..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isSubmitting}
                    className="border-2 border-purple-300 rounded-2xl focus:border-orange-400 min-h-[300px]"
                  />
                </div>

                {/* Moderation Results */}
                {moderationResult && (
                  <div className={`p-4 rounded-2xl border-2 ${
                    moderationResult.passed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      {moderationResult.passed ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                      )}
                      <span className={`font-bold ${
                        moderationResult.passed ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {moderationResult.message}
                      </span>
                    </div>
                    
                    {moderationResult.passed && moderationResult.moderatedContent && (
                      <div className="mt-4">
                        <div className="bg-white p-4 rounded-xl border-2 border-green-300 max-h-60 overflow-y-auto">
                          <p className="text-green-800 whitespace-pre-wrap leading-relaxed">
                            {moderationResult.moderatedContent}
                          </p>
                        </div>
                        <Button
                          onClick={handleFinalPublish}
                          disabled={isSubmitting}
                          className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-full border-4 border-green-300 shadow-lg transform hover:scale-105 transition-all font-bold"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Публикуем...
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5 mr-2" />
                              Опубликовать
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {!moderationResult && (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !title.trim() || !content.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-full border-4 border-purple-300 shadow-lg transform hover:scale-105 transition-all font-bold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Проверяем и улучшаем...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Опубликовать сказку
                      </>
                    )}
                  </Button>
                )}

                <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-200">
                  <p className="text-blue-700 text-sm">
                    <strong>Примечание:</strong> Все сказки проходят автоматическую проверку на соответствие 
                    стандартам детской литературы. Мы можем предложить улучшения для большей читабельности.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Publish;
