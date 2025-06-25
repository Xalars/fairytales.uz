import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Play, BookOpen, Pause, Menu, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLikes } from "@/hooks/useLikes";
import { useAudio } from "@/hooks/useAudio";
import { useFairytales } from "@/hooks/useFairytales";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from '@/integrations/supabase/client';
import MobileNav from "@/components/MobileNav";

interface Story {
  id: string;
  title: string;
  content: string;
  type: string;
  source: 'folk' | 'user_generated' | 'ai_generated';
  image_url?: string;
  audio_url?: string;
  like_count: number;
  created_at: string;
}

const Profile = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { userLikes, isLiked, toggleLike, getLikeCount } = useLikes();
  const { isGenerating, isPlaying, generateAndPlayAudio, stopAudio, isCurrentlyPlaying, isCurrentlyGenerating } = useAudio();
  const { deleteUserFairytale, deleteAIFairytale } = useFairytales();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [aiStories, setAiStories] = useState<Story[]>([]);
  const [likedStories, setLikedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (!authLoading && user) {
      fetchUserData();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (userLikes.length > 0) {
      fetchLikedStories();
    }
  }, [userLikes]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: userStoriesData, error: userError } = await supabase
        .from('user_fairytales')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (userError) throw userError;

      const { data: aiStoriesData, error: aiError } = await supabase
        .from('ai_fairytales')
        .select('*')
        .eq('created_by_user_id', user.id)
        .order('created_at', { ascending: false });

      if (aiError) throw aiError;

      setUserStories((userStoriesData || []).map(story => ({
        id: story.id,
        title: story.title,
        content: story.content,
        type: 'Авторские сказки',
        source: 'user_generated' as const,
        image_url: story.cover_image_url || story.image_url,
        audio_url: story.audio_url,
        like_count: story.like_count || 0,
        created_at: story.created_at
      })));

      setAiStories((aiStoriesData || []).map(story => ({
        id: story.id,
        title: story.title,
        content: story.content,
        type: 'ИИ-сказки',
        source: 'ai_generated' as const,
        image_url: story.cover_image_url || story.image_url,
        audio_url: story.audio_url,
        like_count: story.like_count || 0,
        created_at: story.created_at
      })));

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedStories = async () => {
    try {
      const stories: Story[] = [];

      for (const like of userLikes) {
        let tableName = '';
        let storyType = '';

        switch (like.fairytale_type) {
          case 'folk':
            tableName = 'folk_fairytales';
            storyType = 'Народные сказки';
            break;
          case 'user_generated':
            tableName = 'user_fairytales';
            storyType = 'Опубликованные пользователями';
            break;
          case 'ai_generated':
            tableName = 'ai_fairytales';
            storyType = 'ИИ-сказки';
            break;
        }

        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', like.fairytale_id)
          .single();

        if (!error && data) {
          stories.push({
            id: data.id,
            title: data.title,
            content: data.content,
            type: storyType,
            source: like.fairytale_type,
            image_url: data.cover_image_url || data.image_url,
            audio_url: data.audio_url,
            like_count: data.like_count || 0,
            created_at: data.created_at
          });
        }
      }

      setLikedStories(stories);
    } catch (error) {
      console.error('Error fetching liked stories:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handlePlayAudio = async (story: Story) => {
    if (isCurrentlyPlaying(story.id)) {
      stopAudio();
    } else {
      await generateAndPlayAudio(story.content, story.id, story.source, story.audio_url);
    }
  };

  const handleLike = async (e: React.MouseEvent, story: Story) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;
    
    await toggleLike(story.id, story.source);
  };

  const handleDeleteStory = async (story: Story) => {
    if (!confirm(`Вы уверены, что хотите удалить сказку "${story.title}"?`)) {
      return;
    }

    try {
      let result;
      if (story.source === 'user_generated') {
        result = await deleteUserFairytale(story.id);
      } else if (story.source === 'ai_generated') {
        result = await deleteAIFairytale(story.id);
      } else {
        toast({
          title: "Ошибка",
          description: "Нельзя удалить эту сказку",
          variant: "destructive",
        });
        return;
      }

      if (result.error) {
        toast({
          title: "Ошибка",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Успешно!",
          description: "Сказка удалена",
        });
        await fetchUserData();
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить сказку",
        variant: "destructive",
      });
    }
  };

  const renderStoryCard = (story: Story) => (
    <Card key={`${story.source}-${story.id}`} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-4 border-orange-200 rounded-3xl overflow-hidden transform hover:rotate-1">
      <div className="relative overflow-hidden">
        <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
          {story.image_url ? (
            <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-white opacity-80" />
          )}
        </div>
        <div className="absolute top-3 right-3">
          <Badge 
            variant="secondary" 
            className={`font-comic-medium rounded-full px-2 py-1 text-xs border-2 ${
              story.type === 'Народные сказки' 
                ? 'bg-purple-100 border-purple-300 text-purple-700'
                : story.type === 'Опубликованные пользователями' || story.type === 'Авторские сказки'
                ? 'bg-orange-100 border-orange-300 text-orange-700'
                : 'bg-green-100 border-green-300 text-green-700'
            }`}
          >
            {story.type}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2 px-3 sm:px-6">
        <CardTitle className="text-base sm:text-lg md:text-xl group-hover:text-purple-600 transition-colors font-comic-title mobile-text-wrap">
          {story.title}
        </CardTitle>
        <CardDescription className="text-purple-600 font-comic-medium text-xs sm:text-sm mobile-text-wrap">
          {story.content ? story.content.substring(0, 80) + '...' : 'Содержание недоступно'}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="flex flex-col gap-3">
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
              disabled={isCurrentlyGenerating(story.id)}
            >
              {isCurrentlyGenerating(story.id) ? (
                <>
                  <div className="w-3 h-3 mr-1 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                  Генерация...
                </>
              ) : isCurrentlyPlaying(story.id) ? (
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
            {(story.source === 'user_generated' || story.source === 'ai_generated') && (
              <Button 
                size="sm" 
                variant="outline" 
                className="border-2 border-red-300 text-red-700 hover:bg-red-100 rounded-full font-comic-medium text-xs btn-mobile"
                onClick={() => handleDeleteStory(story)}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Удалить
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <Button
              onClick={(e) => handleLike(e, story)}
              variant="ghost"
              size="sm"
              className="p-1 h-auto hover:bg-transparent"
            >
              <Heart className={`w-4 h-4 mr-1 text-pink-600 ${isLiked(story.id, story.source) ? 'fill-current' : ''}`} />
              <span className="text-sm font-comic-title text-pink-600">{getLikeCount(story.id)}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 flex items-center justify-center font-comic">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-purple-700 font-comic-medium text-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 font-comic">
      {/* Header */}
      <header className="border-b-4 border-orange-200 bg-white/90 backdrop-blur-sm sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 md:h-10 md:w-10 text-purple-600 transform rotate-12" />
            <div>
              <h1 className="text-xl md:text-3xl font-comic-title text-purple-700">
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
              <Link to="/profile" className="text-purple-700 hover:text-orange-600 transition-colors font-comic-medium px-3 py-1 rounded-full border-2 border-orange-300 bg-orange-50">
                Профиль
              </Link>
            </nav>
          )}

          {/* Auth and Mobile Menu */}
          <div className="flex items-center space-x-2">
            {!isMobile && (
              <Button 
                onClick={handleSignOut}
                variant="outline" 
                className="border-2 border-purple-400 text-purple-700 hover:bg-purple-100 rounded-full px-6 py-2 font-comic-medium transform hover:scale-105 transition-all btn-mobile"
              >
                Выйти
              </Button>
            )}

            {isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileNavOpen(true)}
                className="border-2 border-purple-400 text-purple-700 btn-mobile"
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-comic-title text-purple-800 mb-4 transform -rotate-1 mobile-text-wrap">
            Мой Профиль 👤
          </h2>
          <div className="w-32 h-2 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mx-auto"></div>
        </div>

        <Tabs defaultValue="liked" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm rounded-full border-4 border-orange-200 p-2 mb-6 sm:mb-8">
            <TabsTrigger value="liked" className="rounded-full font-comic-title text-purple-700 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800 text-xs sm:text-sm px-2 py-2">
              ❤️ Любимое ({likedStories.length})
            </TabsTrigger>
            <TabsTrigger value="ai-stories" className="rounded-full font-comic-title text-purple-700 data-[state=active]:bg-green-100 data-[state=active]:text-green-800 text-xs sm:text-sm px-2 py-2">
              🤖 ИИ-сказки ({aiStories.length})
            </TabsTrigger>
            <TabsTrigger value="user-stories" className="rounded-full font-comic-title text-purple-700 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800 text-xs sm:text-sm px-2 py-2">
              ✍️ Авторские ({userStories.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="liked">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-purple-700 font-comic-medium text-lg">Загрузка...</p>
              </div>
            ) : likedStories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {likedStories.map(renderStoryCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-orange-200 p-6 sm:p-8 shadow-lg max-w-md mx-auto">
                  <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-purple-700 font-comic-medium text-base sm:text-lg mb-4">Нет понравившихся сказок</p>
                  <p className="text-purple-500 text-sm font-comic mobile-text-wrap">Поставьте лайк на понравившиеся сказки в каталоге</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai-stories">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-purple-700 font-comic-medium text-lg">Загрузка...</p>
              </div>
            ) : aiStories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {aiStories.map(renderStoryCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-orange-200 p-6 sm:p-8 shadow-lg max-w-md mx-auto">
                  <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-green-400 mx-auto mb-4" />
                  <p className="text-purple-700 font-comic-medium text-base sm:text-lg mb-4">Нет ИИ-сказок</p>
                  <p className="text-purple-500 text-sm font-comic mobile-text-wrap">Создайте свои сказки с помощью ИИ</p>
                  <Link to="/ai-fairytales">
                    <Button className="mt-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-full px-6 py-2 font-comic-medium btn-mobile">
                      Создать ИИ-сказку
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="user-stories">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-purple-700 font-comic-medium text-lg">Загрузка...</p>
              </div>
            ) : userStories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {userStories.map(renderStoryCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-orange-200 p-6 sm:p-8 shadow-lg max-w-md mx-auto">
                  <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-orange-400 mx-auto mb-4" />
                  <p className="text-purple-700 font-comic-medium text-base sm:text-lg mb-4">Нет авторских сказок</p>
                  <p className="text-purple-500 text-sm font-comic mobile-text-wrap">Опубликуйте свои собственные сказки</p>
                  <Link to="/publish">
                    <Button className="mt-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full px-6 py-2 font-comic-medium btn-mobile">
                      Опубликовать сказку
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
