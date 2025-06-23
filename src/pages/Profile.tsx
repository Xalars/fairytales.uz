
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Play, BookOpen, Pause } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
  created_at: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { userLikes, isLiked } = useLikes();
  const { isGenerating, isPlaying, generateAndPlayAudio, stopAudio } = useAudio();
  const navigate = useNavigate();
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [aiStories, setAiStories] = useState<Story[]>([]);
  const [likedStories, setLikedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  useEffect(() => {
    if (userLikes.length > 0) {
      fetchLikedStories();
    }
  }, [userLikes]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch user's own stories
      const { data: userStoriesData, error: userError } = await supabase
        .from('user_fairytales')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (userError) throw userError;

      // Fetch user's AI stories
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
        image_url: story.image_url,
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
        image_url: story.image_url,
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
            image_url: data.image_url,
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
    if (isPlaying) {
      stopAudio();
    } else {
      await generateAndPlayAudio(story.content, story.id, story.source, story.audio_url);
    }
  };

  const renderStoryCard = (story: Story) => (
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
            className={`font-bold rounded-full px-3 py-1 border-2 ${
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
            <Heart className={`w-5 h-5 mr-1 ${isLiked(story.id, story.source) ? 'fill-current' : ''}`} />
            <span className="text-sm font-bold">{story.like_count}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return null;
  }

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
            <Link to="/ai-fairytales" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">
              ИИ-сказки
            </Link>
            <Link to="/profile" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-orange-300 bg-orange-50">
              Профиль
            </Link>
          </nav>
          <Button 
            onClick={handleSignOut}
            variant="outline" 
            className="border-2 border-purple-400 text-purple-700 hover:bg-purple-100 rounded-full px-6 py-2 font-medium transform hover:scale-105 transition-all"
          >
            Выйти
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold text-purple-800 mb-4 transform -rotate-1" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Мой Профиль 👤
          </h2>
          <div className="w-32 h-2 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mx-auto"></div>
        </div>

        <Tabs defaultValue="liked" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm rounded-full border-4 border-orange-200 p-2 mb-8">
            <TabsTrigger value="liked" className="rounded-full font-bold text-purple-700 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">
              ❤️ Любимое ({likedStories.length})
            </TabsTrigger>
            <TabsTrigger value="ai-stories" className="rounded-full font-bold text-purple-700 data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
              🤖 Мои ИИ-сказки ({aiStories.length})
            </TabsTrigger>
            <TabsTrigger value="user-stories" className="rounded-full font-bold text-purple-700 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800">
              ✍️ Мои авторские сказки ({userStories.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="liked">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-purple-700 font-medium text-lg">Загрузка...</p>
              </div>
            ) : likedStories.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {likedStories.map(renderStoryCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-orange-200 p-8 shadow-lg max-w-md mx-auto">
                  <Heart className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-purple-700 font-medium text-lg mb-4">Нет понравившихся сказок</p>
                  <p className="text-purple-500 text-sm">Поставьте лайк на понравившиеся сказки в каталоге</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai-stories">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-purple-700 font-medium text-lg">Загрузка...</p>
              </div>
            ) : aiStories.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {aiStories.map(renderStoryCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-orange-200 p-8 shadow-lg max-w-md mx-auto">
                  <BookOpen className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <p className="text-purple-700 font-medium text-lg mb-4">Нет ИИ-сказок</p>
                  <p className="text-purple-500 text-sm">Создайте свои сказки с помощью ИИ</p>
                  <Link to="/ai-fairytales">
                    <Button className="mt-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-full px-6 py-2 font-medium">
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
                <p className="text-purple-700 font-medium text-lg">Загрузка...</p>
              </div>
            ) : userStories.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {userStories.map(renderStoryCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-orange-200 p-8 shadow-lg max-w-md mx-auto">
                  <BookOpen className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                  <p className="text-purple-700 font-medium text-lg mb-4">Нет авторских сказок</p>
                  <p className="text-purple-500 text-sm">Опубликуйте свои собственные сказки</p>
                  <Link to="/publish">
                    <Button className="mt-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full px-6 py-2 font-medium">
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
