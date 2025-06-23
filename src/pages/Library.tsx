
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, Play, BookOpen, Search, Filter, Pause, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFairytales } from "@/hooks/useFairytales";
import { useLikes } from "@/hooks/useLikes";
import { useAudio } from "@/hooks/useAudio";

const Library = () => {
  const { user, signOut } = useAuth();
  const { fairytales, userFairytales, aiFairytales, loading, refetch } = useFairytales();
  const { toggleLike, isLiked } = useLikes();
  const { isGenerating, isPlaying, generateAndPlayAudio, stopAudio } = useAudio();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Combine all stories with proper typing
  const allStories = [
    ...fairytales.map((fairytale) => ({
      id: fairytale.id,
      title: fairytale.title || 'Народная сказка',
      content: fairytale.content || '',
      type: "Народные сказки",
      source: 'folk' as const,
      image_url: fairytale.cover_image_url || fairytale.image_url,
      audio_url: fairytale.audio_url,
      like_count: fairytale.like_count || 0,
      created_at: fairytale.created_at
    })),
    ...userFairytales.map((fairytale) => ({
      id: fairytale.id,
      title: fairytale.title || 'Пользовательская сказка',
      content: fairytale.content || '',
      type: "Опубликованные пользователями",
      source: 'user_generated' as const,
      image_url: fairytale.cover_image_url || fairytale.image_url,
      audio_url: fairytale.audio_url,
      like_count: fairytale.like_count || 0,
      created_at: fairytale.created_at
    })),
    ...aiFairytales.map((fairytale) => ({
      id: fairytale.id,
      title: fairytale.title || 'ИИ-сказка',
      content: fairytale.content || '',
      type: "ИИ-сказки",
      source: 'ai_generated' as const,
      image_url: fairytale.cover_image_url || fairytale.image_url,
      audio_url: fairytale.audio_url,
      like_count: fairytale.like_count || 0,
      created_at: fairytale.created_at
    }))
  ];

  // Filter stories based on search and category
  const filteredStories = allStories.filter((story) => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'folk' && story.source === 'folk') ||
                           (selectedCategory === 'user' && story.source === 'user_generated') ||
                           (selectedCategory === 'ai' && story.source === 'ai_generated');
    return matchesSearch && matchesCategory;
  });

  const handleSignOut = async () => {
    await signOut();
  };

  const handleLike = async (storyId: string, source: 'folk' | 'user_generated' | 'ai_generated') => {
    await toggleLike(storyId, source);
    // Refetch stories to get updated like counts
    await refetch();
  };

  const handlePlayAudio = async (story: any) => {
    if (isPlaying) {
      stopAudio();
    } else {
      await generateAndPlayAudio(story.content, story.id, story.source, story.audio_url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100">
      {/* Header */}
      <header className="border-b-4 border-orange-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 md:h-10 md:w-10 text-purple-600 transform rotate-12" />
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-purple-700" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                fAIrytales.uz
              </h1>
              <p className="text-xs md:text-sm text-purple-500 italic">Узбекские сказки с ИИ</p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/library" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-orange-300 bg-orange-50">
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
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-orange-200 bg-white/95 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 space-y-2">
              <Link to="/library" className="block text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-2 rounded-full border-2 border-orange-300 bg-orange-50 text-center">
                Каталог
              </Link>
              <Link to="/publish" className="block text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-2 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50 text-center">
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
                <Link to="/auth" className="block">
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-purple-400 text-purple-700 hover:bg-purple-100 rounded-full px-6 py-2 font-medium"
                  >
                    Войти
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-5xl font-bold text-purple-800 mb-4 transform -rotate-1" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Каталог Сказок 📚
          </h2>
          <div className="w-32 h-2 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mx-auto"></div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-orange-200 p-4 md:p-6 mb-8 shadow-lg">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
              <Input
                placeholder="Поиск сказок..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-purple-300 rounded-full bg-white/90 focus:border-purple-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
                className="rounded-full border-2 text-xs md:text-sm"
                size="sm"
              >
                <Filter className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                Все
              </Button>
              <Button
                variant={selectedCategory === 'folk' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('folk')}
                className="rounded-full border-2 text-xs md:text-sm"
                size="sm"
              >
                Народные
              </Button>
              <Button
                variant={selectedCategory === 'user' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('user')}
                className="rounded-full border-2 text-xs md:text-sm"
                size="sm"
              >
                Пользовательские
              </Button>
              <Button
                variant={selectedCategory === 'ai' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('ai')}
                className="rounded-full border-2 text-xs md:text-sm"
                size="sm"
              >
                ИИ
              </Button>
            </div>
          </div>
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-purple-700 font-medium text-lg">Загрузка сказок...</p>
          </div>
        ) : filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredStories.map((story) => (
              <Card key={`${story.source}-${story.id}`} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-4 border-orange-200 rounded-3xl overflow-hidden transform hover:rotate-1">
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
                      className={`font-bold rounded-full px-2 py-1 text-xs border-2 ${
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
                  <CardTitle className="text-lg md:text-xl group-hover:text-purple-600 transition-colors font-bold" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    {story.title}
                  </CardTitle>
                  <CardDescription className="text-purple-600 font-medium text-sm">
                    {story.content ? story.content.substring(0, 100) + '...' : 'Содержание недоступно'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex gap-2 flex-wrap">
                      <Link to={`/story/${story.source}/${story.id}`}>
                        <Button size="sm" variant="outline" className="border-2 border-purple-300 text-purple-700 hover:bg-purple-100 rounded-full font-medium text-xs">
                          <BookOpen className="w-3 h-3 mr-1" />
                          Читать
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-2 border-green-300 text-green-700 hover:bg-green-100 rounded-full font-medium text-xs"
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
                      <button
                        onClick={() => handleLike(story.id, story.source)}
                        className="flex items-center hover:scale-110 transition-transform"
                        disabled={!user}
                      >
                        <Heart className={`w-4 h-4 mr-1 ${isLiked(story.id, story.source) ? 'fill-current' : ''}`} />
                        <span className="text-sm font-bold">{story.like_count}</span>
                      </button>
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
              <p className="text-purple-700 font-medium text-lg">Сказки не найдены</p>
              <p className="text-purple-500 text-sm mt-2">Попробуйте изменить критерии поиска</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
