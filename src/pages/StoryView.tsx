
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, Play, BookOpen, Pause, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLikes } from "@/hooks/useLikes";
import { useAudio } from "@/hooks/useAudio";
import { supabase } from '@/integrations/supabase/client';

interface Story {
  id: string;
  title: string;
  content: string;
  type: string;
  source: 'folk' | 'user_generated' | 'ai_generated';
  image_url?: string;
  audio_url?: string;
  like_count: number;
}

const StoryView = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toggleLike, isLiked } = useLikes();
  const { isGenerating, isPlaying, generateAndPlayAudio, stopAudio } = useAudio();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      if (!id || !type) return;

      try {
        setLoading(true);
        let tableName = '';
        let storyType = '';
        let source: 'folk' | 'user_generated' | 'ai_generated' = 'folk';

        switch (type) {
          case 'folk':
            tableName = 'folk_fairytales';
            storyType = 'Народные сказки';
            source = 'folk';
            break;
          case 'user_generated':
            tableName = 'user_fairytales';
            storyType = 'Опубликованные пользователями';
            source = 'user_generated';
            break;
          case 'ai_generated':
            tableName = 'ai_fairytales';
            storyType = 'ИИ-сказки';
            source = 'ai_generated';
            break;
          default:
            navigate('/library');
            return;
        }

        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        setStory({
          id: data.id,
          title: data.title || 'Без названия',
          content: data.content || '',
          type: storyType,
          source,
          image_url: data.cover_image_url || data.image_url,
          audio_url: data.audio_url,
          like_count: data.like_count || 0
        });
      } catch (error) {
        console.error('Error fetching story:', error);
        navigate('/library');
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id, type, navigate]);

  const handleLike = async () => {
    if (!story || !user) return;

    setLikeLoading(true);
    try {
      const wasLiked = isLiked(story.id, story.source);
      await toggleLike(story.id, story.source);
      
      // Update local like count
      setStory(prev => prev ? {
        ...prev,
        like_count: wasLiked ? prev.like_count - 1 : prev.like_count + 1
      } : null);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!story) return;
    
    if (isPlaying) {
      stopAudio();
    } else {
      await generateAndPlayAudio(story.content, story.id, story.source, story.audio_url);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 flex items-center justify-center">
        <p className="text-purple-700 font-medium text-lg">Загрузка сказки...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 flex items-center justify-center">
        <p className="text-purple-700 font-medium text-lg">Сказка не найдена</p>
      </div>
    );
  }

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
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-orange-200 bg-white/95 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 space-y-2">
              <Link to="/library" className="block text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-2 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50 text-center">
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
                <div className="space-y-2">
                  <Link to="/auth" className="block">
                    <Button 
                      variant="outline" 
                      className="w-full border-2 border-purple-400 text-purple-700 hover:bg-purple-100 rounded-full px-6 py-2 font-medium"
                    >
                      Войти
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup" className="block">
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          onClick={() => navigate('/library')}
          variant="outline"
          className="mb-6 border-2 border-purple-300 text-purple-700 hover:bg-purple-100 rounded-full font-medium"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к каталогу
        </Button>

        {/* Story Card */}
        <Card className="bg-white border-4 border-orange-200 rounded-3xl overflow-hidden shadow-lg max-w-4xl mx-auto">
          {/* Story Image */}
          {story.image_url && (
            <div className="w-full h-48 md:h-64 lg:h-80 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
            </div>
          )}

          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row items-start md:items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl md:text-3xl lg:text-4xl text-purple-700 mb-2 font-bold" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  {story.title}
                </CardTitle>
                <p className="text-purple-600 font-medium">{story.type}</p>
              </div>
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                {user && (
                  <Button
                    onClick={handleLike}
                    disabled={likeLoading}
                    variant="outline"
                    size="sm"
                    className={`border-2 rounded-full font-medium ${
                      isLiked(story.id, story.source)
                        ? 'border-pink-400 bg-pink-100 text-pink-700'
                        : 'border-pink-300 text-pink-700 hover:bg-pink-100'
                    }`}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${isLiked(story.id, story.source) ? 'fill-current' : ''}`} />
                    {story.like_count}
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-2 border-green-300 text-green-700 hover:bg-green-100 rounded-full font-medium"
                  onClick={handlePlayAudio}
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
            </div>
          </CardHeader>

          <CardContent className="prose prose-purple max-w-none">
            <div className="text-gray-700 leading-relaxed text-base md:text-lg whitespace-pre-wrap">
              {story.content}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoryView;
