import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Play, BookOpen, Sparkles, Users, Bot, Crown, Pause, Star, Moon, Globe, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFairytales } from "@/hooks/useFairytales";
import { useLikes } from "@/hooks/useLikes";
import { useAudio } from "@/hooks/useAudio";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileNav from "@/components/MobileNav";

const Index = () => {
  const { user, signOut } = useAuth();
  const { fairytales, userFairytales, aiFairytales, loading } = useFairytales();
  const { getLikeCount } = useLikes();
  const { isGenerating, isPlaying, generateAndPlayAudio, stopAudio } = useAudio();
  const isMobile = useIsMobile();
  const [topStories, setTopStories] = useState<any[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  const handlePlayAudio = async (story: any) => {
    if (isPlaying) {
      stopAudio();
    } else {
      await generateAndPlayAudio(story.content, story.id, story.source, story.audio_url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 relative overflow-hidden font-comic" style={{ fontFamily: "'Comic Sans MS', cursive, system-ui, -apple-system, sans-serif" }}>
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

      {/* Header with mobile navigation */}
      <header className="border-b-4 border-orange-200 bg-white/90 backdrop-blur-sm sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 md:h-10 md:w-10 text-purple-600 transform rotate-12" />
            <div>
              <h1 className="text-xl md:text-3xl font-comic-title text-purple-700" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
                fAIrytales.uz
              </h1>
              <p className="text-xs md:text-sm text-purple-500 italic font-comic">Узбекские сказки с ИИ</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex items-center space-x-6">
              <Link to="/library" className="text-purple-700 hover:text-orange-600 transition-colors font-comic-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">
                Каталог
              </Link>
              <Link to="/publish" className="text-purple-700 hover:text-orange-600 transition-colors font-comic-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">
                Опубликовать сказку
              </Link>
              <Link to="/ai-fairytales" className="text-purple-700 hover:text-orange-600 transition-colors font-comic-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">
                ИИ-сказки
              </Link>
              {user && (
                <Link to="/profile" className="text-purple-700 hover:text-orange-600 transition-colors font-comic-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">
                  Профиль
                </Link>
              )}
            </nav>
          )}

          {/* Auth buttons */}
          <div className="flex items-center space-x-2">
            {user ? (
              <Button 
                onClick={handleSignOut}
                variant="outline" 
                className="border-2 border-purple-400 text-purple-700 hover:bg-purple-100 rounded-full px-4 md:px-6 py-2 font-comic-medium transform hover:scale-105 transition-all text-sm md:text-base btn-mobile"
              >
                Выйти
              </Button>
            ) : (
              <Link to="/auth">
                <Button 
                  variant="outline" 
                  className="border-2 border-purple-400 text-purple-700 hover:bg-purple-100 rounded-full px-4 md:px-6 py-2 font-comic-medium transform hover:scale-105 transition-all text-sm md:text-base btn-mobile"
                >
                  Войти
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            {isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileNavOpen(true)}
                className="border-2 border-purple-400 text-purple-700 hover:bg-purple-100 rounded-full ml-2 btn-mobile"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 md:py-16 text-center relative">
        <div className="max-w-4xl mx-auto relative">
          {/* Decorative elements */}
          <div className="absolute -top-10 left-20 opacity-30 hidden md:block">
            <div className="w-16 h-16 bg-yellow-200 rounded-full border-4 border-yellow-300"></div>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-comic-title text-purple-800 mb-6 leading-tight transform -rotate-1 mobile-text-wrap">
            Волшебные
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent block transform rotate-1">
              Узбекские Сказки
            </span>
          </h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-orange-200 p-4 md:p-6 mx-2 sm:mx-4 mb-8 shadow-lg transform rotate-1">
            <p className="text-base sm:text-lg md:text-xl text-purple-700 max-w-2xl mx-auto font-comic-medium mobile-text-wrap">
              Читайте, слушайте и создавайте магические истории с помощью ИИ. 
              Погрузитесь в мир узбекского фольклора!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-2">
            <Link to="/library">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-full border-4 border-purple-300 shadow-lg transform hover:scale-105 transition-all font-comic-title text-sm md:text-base btn-mobile"
              >
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                Начать читать
              </Button>
            </Link>
            <Link to="/ai-fairytales">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto border-4 border-orange-400 text-orange-700 hover:bg-orange-100 px-6 md:px-8 py-3 md:py-4 rounded-full shadow-lg transform hover:scale-105 transition-all font-comic-title text-sm md:text-base btn-mobile"
              >
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                Сгенерировать сказку
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Stories Section */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-comic-title text-purple-800 mb-4 transform rotate-1 mobile-text-wrap">
            Топ Сказок ⭐
          </h2>
          <p className="text-purple-600 text-base sm:text-lg md:text-xl font-comic-medium">Самые любимые истории нашего сообщества</p>
          <div className="w-32 h-2 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mx-auto mt-4"></div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-purple-700 font-comic-medium text-lg">Загрузка топ сказок...</p>
          </div>
        ) : topStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {topStories.map((story, index) => (
              <Card key={`${story.source}-${story.id}`} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-4 border-orange-200 rounded-3xl overflow-hidden transform hover:rotate-1 relative">
                {index === 0 && (
                  <div className="absolute top-3 left-3 z-10">
                    <Crown className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
                  </div>
                )}
                <div className="relative overflow-hidden">
                  <div className="w-full h-36 md:h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    {story.image_url ? (
                      <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-white opacity-80" />
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant="secondary" 
                      className={`font-comic-medium rounded-full px-2 py-1 text-xs border-2 ${
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
                  <CardTitle className="text-base sm:text-lg md:text-xl group-hover:text-purple-600 transition-colors font-comic-title mobile-text-wrap">
                    {story.title}
                  </CardTitle>
                  <CardDescription className="text-purple-600 font-comic-medium text-sm mobile-text-wrap">
                    {story.content ? story.content.substring(0, 80) + '...' : 'Содержание недоступно'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex gap-2 flex-wrap">
                      <Link to={`/story/${story.source}/${story.id}`}>
                        <Button size="sm" variant="outline" className="border-2 border-purple-300 text-purple-700 hover:bg-purple-100 rounded-full font-comic-medium text-xs btn-mobile">
                          <BookOpen className="w-3 h-3 mr-1" />
                          Читать
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-2 border-green-300 text-green-700 hover:bg-green-100 rounded-full font-comic-medium text-xs btn-mobile"
                        onClick={() => handlePlayAudio(story)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <div className="w-3 h-3 mr-1 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                            Генерация...
                          </>
                        ) : isPlaying ? (
                          <>
                            <Pause className="w-3 h-3 mr-1" />
                            Стоп
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            Слушать
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center text-pink-600">
                      <Heart className="w-4 h-4 mr-1" />
                      <span className="text-sm font-comic-title">{getLikeCount(story.id)}</span>
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
              <p className="text-purple-700 font-comic-medium text-lg">Сказки загружаются...</p>
            </div>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-purple-200 p-6 md:p-8 shadow-lg transform rotate-1 hover:scale-105 transition-all">
            <div className="text-2xl sm:text-3xl md:text-5xl font-comic-title text-purple-600 mb-2">{fairytales.length + userFairytales.length + aiFairytales.length}+</div>
            <div className="text-purple-700 font-comic-medium text-base md:text-lg">Сказок</div>
            <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 fill-current mx-auto mt-2" />
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-orange-200 p-6 md:p-8 shadow-lg transform -rotate-1 hover:scale-105 transition-all">
            <div className="text-2xl sm:text-3xl md:text-5xl font-comic-title text-orange-600 mb-2">3</div>
            <div className="text-orange-700 font-comic-medium text-base md:text-lg">Языка</div>
            <Globe className="w-6 h-6 md:w-8 md:h-8 text-orange-400 mx-auto mt-2" />
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-green-200 p-6 md:p-8 shadow-lg transform rotate-1 hover:scale-105 transition-all">
            <div className="text-2xl sm:text-3xl md:text-5xl font-comic-title text-green-600 mb-2">1000+</div>
            <div className="text-green-700 font-comic-medium text-base md:text-lg">Счастливых Читателей</div>
            <Heart className="w-6 h-6 md:w-8 md:h-8 text-pink-400 fill-current mx-auto mt-2" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-comic-title text-purple-800 mb-4 text-center transform rotate-1 mobile-text-wrap">
            Читайте, слушайте и создавайте магические истории с помощью ИИ
          </h2>
          <p className="text-base md:text-lg text-purple-600 mb-8 text-center font-comic-medium">Погрузитесь в мир узбекского фольклора!</p>
          <div className="flex flex-col sm:flex-row gap-4 px-2">
            <Link to="/library">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-full border-4 border-purple-300 shadow-lg transform hover:scale-105 transition-all font-comic-title text-sm md:text-base btn-mobile"
              >
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                Начать читать
              </Button>
            </Link>
            <Link to="/ai-fairytales">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto border-4 border-orange-400 text-orange-700 hover:bg-orange-100 px-6 md:px-8 py-3 md:py-4 rounded-full shadow-lg transform hover:scale-105 transition-all font-comic-title text-sm md:text-base btn-mobile"
              >
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                Сгенерировать сказку
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-purple-800 text-white py-8 md:py-12 border-t-8 border-purple-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 h-6 md:h-8 md:w-8 text-yellow-400" />
                <span className="text-xl md:text-2xl font-comic-title">fAIrytales.uz</span>
              </div>
              <p className="text-purple-200 font-comic-medium text-sm md:text-base mobile-text-wrap">
                Узбекские сказки с магией ИИ - читайте, слушайте и создавайте!
              </p>
            </div>
            <div>
              <h4 className="font-comic-title mb-4 text-base md:text-lg">Исследовать</h4>
              <ul className="space-y-2 text-purple-200 text-sm md:text-base">
                <li><Link to="/library" className="hover:text-yellow-400 transition-colors font-comic-medium">Каталог Сказок</Link></li>
                <li><Link to="/ai-fairytales" className="hover:text-yellow-400 transition-colors font-comic-medium">ИИ-сказки</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-comic-title mb-4 text-base md:text-lg">Создавать</h4>
              <ul className="space-y-2 text-purple-200 text-sm md:text-base">
                <li><Link to="/publish" className="hover:text-yellow-400 transition-colors font-comic-medium">Опубликовать сказку</Link></li>
                <li><Link to="/ai-fairytales" className="hover:text-yellow-400 transition-colors font-comic-medium">Генерировать ИИ сказку</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-comic-title mb-4 text-base md:text-lg">Аккаунт</h4>
              <ul className="space-y-2 text-purple-200 text-sm md:text-base">
                <li><Link to="/auth" className="hover:text-yellow-400 transition-colors font-comic-medium">Профиль</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t-2 border-purple-600 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-purple-200">
            <p className="font-comic-medium text-sm md:text-base">© 2024 fAIrytales.uz. Создано с магией и технологиями! ✨</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
