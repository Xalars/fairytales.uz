
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Play, BookOpen, Sparkles, Users, Bot, Crown, Pause, Star, Moon, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFairytales } from "@/hooks/useFairytales";
import { useLikes } from "@/hooks/useLikes";
import { useAudio } from "@/hooks/useAudio";

const Index = () => {
  const { user, signOut } = useAuth();
  const { fairytales, userFairytales, aiFairytales, loading } = useFairytales();
  const { toggleLike, isLiked } = useLikes();
  const { isGenerating, isPlaying, generateAndPlayAudio, stopAudio } = useAudio();
  const [topStories, setTopStories] = useState<any[]>([]);

  // Get top 3 stories by like count
  useEffect(() => {
    if (!loading) {
      const allStories = [
        ...fairytales.map((story) => ({
          id: story.id,
          title: story.title || 'Народная сказка',
          content: story.content || '',
          type: "Народные сказки",
          source: 'folk' as const,
          image_url: story.image_url,
          audio_url: story.audio_url,
          like_count: story.like_count || 0,
          created_at: story.created_at
        })),
        ...userFairytales.map((story) => ({
          id: story.id,
          title: story.title || 'Пользовательская сказка',
          content: story.content || '',
          type: "Опубликованные пользователями",
          source: 'user_generated' as const,
          image_url: story.image_url,
          audio_url: story.audio_url,
          like_count: story.like_count || 0,
          created_at: story.created_at
        })),
        ...aiFairytales.map((story) => ({
          id: story.id,
          title: story.title || 'ИИ-сказка',
          content: story.content || '',
          type: "ИИ-сказки",
          source: 'ai_generated' as const,
          image_url: story.image_url,
          audio_url: story.audio_url,
          like_count: story.like_count || 0,
          created_at: story.created_at
        }))
      ];

      // Sort by like count and take top 3
      const sortedStories = allStories.sort((a, b) => b.like_count - a.like_count);
      setTopStories(sortedStories.slice(0, 3));
    }
  }, [fairytales, userFairytales, aiFairytales, loading]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleLike = async (storyId: string, source: 'folk' | 'user_generated' | 'ai_generated') => {
    if (user) {
      await toggleLike(storyId, source);
    }
  };

  const handlePlayAudio = async (story: any) => {
    if (isPlaying) {
      stopAudio();
    } else {
      await generateAndPlayAudio(story.content, story.id, story.source, story.audio_url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 relative overflow-hidden">
      {/* Decorative clouds and stars */}
      <div className="absolute top-10 left-10 opacity-20">
        <div className="w-20 h-12 bg-white rounded-full"></div>
        <div className="w-16 h-10 bg-white rounded-full -mt-6 ml-4"></div>
      </div>
      <div className="absolute top-20 right-20 opacity-30">
        <Star className="w-8 h-8 text-yellow-400 fill-current" />
      </div>
      <div className="absolute top-40 right-10 opacity-20">
        <Moon className="w-12 h-12 text-yellow-300 fill-current" />
      </div>

      {/* Header with updated navigation */}
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
            <Link to="/ai-fairytales" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">
              ИИ-сказки
            </Link>
            {user && (
              <Link to="/profile" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">
                Профиль
              </Link>
            )}
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
            <Link to="/auth">
              <Button 
                variant="outline" 
                className="border-2 border-purple-400 text-purple-700 hover:bg-purple-100 rounded-full px-6 py-2 font-medium transform hover:scale-105 transition-all"
              >
                Войти
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section with updated buttons */}
      <section className="container mx-auto px-4 py-16 text-center relative">
        <div className="max-w-4xl mx-auto relative">
          {/* Decorative elements */}
          <div className="absolute -top-10 left-20 opacity-30">
            <div className="w-16 h-16 bg-yellow-200 rounded-full border-4 border-yellow-300"></div>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-bold text-purple-800 mb-6 leading-tight transform -rotate-1" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Волшебные
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent block transform rotate-1">
              Узбекские Сказки
            </span>
          </h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-orange-200 p-6 mx-4 mb-8 shadow-lg transform rotate-1">
            <p className="text-xl text-purple-700 max-w-2xl mx-auto font-medium">
              Читайте, слушайте и создавайте магические истории с помощью ИИ. 
              Погрузитесь в мир узбекского фольклора!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/library">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full border-4 border-purple-300 shadow-lg transform hover:scale-105 transition-all font-bold"
              >
                <BookOpen className="w-6 h-6 mr-2" />
                Начать читать
              </Button>
            </Link>
            <Link to="/ai-fairytales">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-4 border-orange-400 text-orange-700 hover:bg-orange-100 px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all font-bold"
              >
                <Sparkles className="w-6 h-6 mr-2" />
                Сгенерировать сказку
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Stories Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-purple-800 mb-4 transform rotate-1" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Топ Сказок ⭐
          </h2>
          <p className="text-purple-600 text-xl">Самые любимые истории нашего сообщества</p>
          <div className="w-32 h-2 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mx-auto mt-4"></div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-purple-700 font-medium text-lg">Загрузка топ сказок...</p>
          </div>
        ) : topStories.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {topStories.map((story, index) => (
              <Card key={`${story.source}-${story.id}`} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-4 border-orange-200 rounded-3xl overflow-hidden transform hover:rotate-1 relative">
                {index === 0 && (
                  <div className="absolute top-3 left-3 z-10">
                    <Crown className="w-8 h-8 text-yellow-500" />
                  </div>
                )}
                <div className="relative overflow-hidden">
                  <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    {story.image_url ? (
                      <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-16 h-16 text-white opacity-80" />
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant="secondary" 
                      className={`font-bold rounded-full px-3 py-1 border-2 ${
                        story.type === 'Народные сказки' 
                          ? 'bg-purple-100 border-purple-300 text-purple-700'
                          : story.type === 'Опубликованные пользователями'
                          ? 'bg-orange-100 border-orange-300 text-orange-700'
                          : 'bg-green-100 border-green-300 text-green-700'
                      }`}
                    >
                      {story.type}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl group-hover:text-purple-600 transition-colors font-bold" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    {story.title}
                  </CardTitle>
                  <CardDescription className="text-purple-600 font-medium">
                    {story.content ? story.content.substring(0, 100) + '...' : 'Содержание недоступно'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Link to={`/story/${story.source}/${story.id}`}>
                        <Button size="sm" variant="outline" className="border-2 border-purple-300 text-purple-700 hover:bg-purple-100 rounded-full font-medium">
                          <BookOpen className="w-4 h-4 mr-1" />
                          Читать
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-2 border-green-300 text-green-700 hover:bg-green-100 rounded-full font-medium"
                        onClick={() => handlePlayAudio(story)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                            Генерация...
                          </>
                        ) : isPlaying ? (
                          <>
                            <Pause className="w-4 h-4 mr-1" />
                            Стоп
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Слушать
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center text-pink-600">
                      {user && (
                        <button
                          onClick={() => handleLike(story.id, story.source)}
                          className="flex items-center hover:scale-110 transition-transform mr-2"
                        >
                          <Heart className={`w-5 h-5 mr-1 ${isLiked(story.id, story.source) ? 'fill-current' : ''}`} />
                        </button>
                      )}
                      <span className="text-sm font-bold">{story.like_count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-orange-200 p-8 shadow-lg max-w-md mx-auto">
              <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-purple-700 font-medium text-lg">Сказки загружаются...</p>
            </div>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-purple-200 p-8 shadow-lg transform rotate-1 hover:scale-105 transition-all">
            <div className="text-5xl font-bold text-purple-600 mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>{fairytales.length + userFairytales.length + aiFairytales.length}+</div>
            <div className="text-purple-700 font-medium text-lg">Сказок</div>
            <Star className="w-8 h-8 text-yellow-400 fill-current mx-auto mt-2" />
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-orange-200 p-8 shadow-lg transform -rotate-1 hover:scale-105 transition-all">
            <div className="text-5xl font-bold text-orange-600 mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>3</div>
            <div className="text-orange-700 font-medium text-lg">Языка</div>
            <Globe className="w-8 h-8 text-orange-400 mx-auto mt-2" />
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-green-200 p-8 shadow-lg transform rotate-1 hover:scale-105 transition-all">
            <div className="text-5xl font-bold text-green-600 mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>1000+</div>
            <div className="text-green-700 font-medium text-lg">Счастливых Читателей</div>
            <Heart className="w-8 h-8 text-pink-400 fill-current mx-auto mt-2" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold text-purple-800 mb-4 transform rotate-1" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Читайте, слушайте и создавайте магические истории с помощью ИИ
          </h2>
          <p className="text-lg text-purple-600 mb-8">Погрузитесь в мир узбекского фольклора!</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/library">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full border-4 border-purple-300 shadow-lg transform hover:scale-105 transition-all font-bold"
              >
                <BookOpen className="w-6 h-6 mr-2" />
                Начать читать
              </Button>
            </Link>
            <Link to="/ai-fairytales">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-4 border-orange-400 text-orange-700 hover:bg-orange-100 px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all font-bold"
              >
                <Sparkles className="w-6 h-6 mr-2" />
                Сгенерировать сказку
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer with cartoon styling */}
      <footer className="bg-purple-800 text-white py-12 border-t-8 border-purple-600">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-8 w-8 text-yellow-400" />
                <span className="text-2xl font-bold" style={{ fontFamily: 'Comic Sans MS, cursive' }}>fAIrytales.uz</span>
              </div>
              <p className="text-purple-200 font-medium">
                Узбекские сказки с магией ИИ - читайте, слушайте и создавайте!
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg" style={{ fontFamily: 'Comic Sans MS, cursive' }}>Исследовать</h4>
              <ul className="space-y-2 text-purple-200">
                <li><Link to="/library" className="hover:text-yellow-400 transition-colors font-medium">Каталог Сказок</Link></li>
                <li><Link to="/ai-fairytales" className="hover:text-yellow-400 transition-colors font-medium">ИИ-сказки</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg" style={{ fontFamily: 'Comic Sans MS, cursive' }}>Создавать</h4>
              <ul className="space-y-2 text-purple-200">
                <li><Link to="/publish" className="hover:text-yellow-400 transition-colors font-medium">Опубликовать сказку</Link></li>
                <li><Link to="/ai-fairytales" className="hover:text-yellow-400 transition-colors font-medium">Генерировать ИИ сказку</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg" style={{ fontFamily: 'Comic Sans MS, cursive' }}>Аккаунт</h4>
              <ul className="space-y-2 text-purple-200">
                <li><Link to="/auth" className="hover:text-yellow-400 transition-colors font-medium">Профиль</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t-2 border-purple-600 mt-8 pt-8 text-center text-purple-200">
            <p className="font-medium">© 2024 fAIrytales.uz. Создано с магией и технологиями! ✨</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
