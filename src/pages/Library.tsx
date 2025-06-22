import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, BookOpen, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFairytales } from "@/hooks/useFairytales";
import { useLikes } from "@/hooks/useLikes";
import { TTSPlayer } from "@/components/TTSPlayer";

const Library = () => {
  const { user, signOut } = useAuth();
  const { fairytales, userFairytales, aiFairytales, loading, getUserFairytales } = useFairytales();
  const { toggleLike, isLiked } = useLikes();
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreloaded, setShowPreloaded] = useState(true);
  const [showUserGenerated, setShowUserGenerated] = useState(true);
  const [showAIGenerated, setShowAIGenerated] = useState(true);
  const [showMyPublished, setShowMyPublished] = useState(false);
  const [myStories, setMyStories] = useState<any[]>([]);

  // Fetch user's published stories when filter is enabled
  React.useEffect(() => {
    if (showMyPublished && user) {
      getUserFairytales(user.id).then(setMyStories);
    }
  }, [showMyPublished, user, getUserFairytales]);

  // Combine all stories for display
  const allStories = useMemo(() => {
    if (showMyPublished && user) {
      return myStories.map(story => ({
        id: story.id,
        title: story.title,
        content: story.content || '',
        type: story.source === 'user' ? 'Мои опубликованные' : 'Мои ИИ-сказки',
        source: story.source,
        language: story.language || 'russian',
        image_url: story.image_url,
        like_count: story.like_count || 0
      }));
    }

    const stories = [];
    
    // Add preloaded fairytales
    if (showPreloaded) {
      stories.push(...fairytales.map(fairytale => ({
        id: fairytale.id,
        title: fairytale.title,
        content: fairytale.text_ru || fairytale.content || '',
        type: 'Народные сказки',
        source: 'preloaded',
        language: fairytale.language || 'russian',
        image_url: fairytale.image_url,
        like_count: fairytale.like_count || 0
      })));
    }
    
    // Add user-generated fairytales
    if (showUserGenerated) {
      stories.push(...userFairytales.map(fairytale => ({
        id: fairytale.id,
        title: fairytale.title,
        content: fairytale.content || '',
        type: 'Опубликованные пользователями',
        source: 'user_generated',
        language: 'russian',
        image_url: fairytale.image_url,
        like_count: fairytale.like_count || 0
      })));
    }
    
    // Add AI-generated fairytales
    if (showAIGenerated) {
      stories.push(...aiFairytales.map(fairytale => ({
        id: fairytale.id,
        title: fairytale.title,
        content: fairytale.content || '',
        type: 'ИИ-сказки',
        source: 'ai_generated',
        language: fairytale.language || 'russian',
        image_url: fairytale.image_url,
        like_count: fairytale.like_count || 0
      })));
    }
    
    return stories;
  }, [fairytales, userFairytales, aiFairytales, showPreloaded, showUserGenerated, showAIGenerated, showMyPublished, myStories, user]);

  // Filter stories based on search term
  const filteredStories = useMemo(() => {
    return allStories.filter(story =>
      story.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allStories, searchTerm]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleLike = async (storyId: string, storySource: string) => {
    if (!user) return;
    
    const fairytaleType = storySource === 'preloaded' ? 'folk' : 
                         storySource === 'user_generated' ? 'user' : 'ai';
    
    await toggleLike(storyId, fairytaleType);
  };

  const getStoryImage = (story: any) => {
    if (story.image_url) {
      return story.image_url;
    }
    
    // Default images based on story type
    const defaultImages = {
      'Народные сказки': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'Опубликованные пользователями': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
      'ИИ-сказки': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      'Мои опубликованные': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
      'Мои ИИ-сказки': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
    };
    
    return defaultImages[story.type as keyof typeof defaultImages] || defaultImages['Народные сказки'];
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
            <Link to="/library" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-orange-300 bg-orange-50">
              Каталог
            </Link>
            <Link to="/publish" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">
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
            Каталог Сказок 📚
          </h2>
          <div className="w-32 h-2 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mx-auto"></div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-orange-200 p-6 mb-8 shadow-lg">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-5 h-5" />
              <Input
                type="text"
                placeholder="Поиск по названию сказки..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-purple-300 rounded-full py-3 text-purple-700 placeholder-purple-400 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>

            {/* Enhanced Filter Checkboxes */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-700">Фильтры:</span>
              </div>
              
              {user && (
                <div className="flex items-center space-x-3 bg-gradient-to-r from-pink-50 to-pink-100 rounded-full px-6 py-3 border-4 border-pink-200 hover:border-pink-400 transition-all shadow-lg transform hover:scale-105">
                  <Checkbox
                    id="my-published"
                    checked={showMyPublished}
                    onCheckedChange={(checked) => setShowMyPublished(checked === true)}
                    className="border-3 border-pink-400 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 rounded-lg w-5 h-5"
                  />
                  <label htmlFor="my-published" className="text-lg font-bold text-pink-700 cursor-pointer select-none" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    📝 Опубликованные мной
                  </label>
                </div>
              )}
              
              {!showMyPublished && (
                <>
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-full px-6 py-3 border-4 border-purple-200 hover:border-purple-400 transition-all shadow-lg transform hover:scale-105">
                    <Checkbox
                      id="preloaded"
                      checked={showPreloaded}
                      onCheckedChange={(checked) => setShowPreloaded(checked === true)}
                      className="border-3 border-purple-400 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 rounded-lg w-5 h-5"
                    />
                    <label htmlFor="preloaded" className="text-lg font-bold text-purple-700 cursor-pointer select-none" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      🏰 Народные сказки
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-full px-6 py-3 border-4 border-orange-200 hover:border-orange-400 transition-all shadow-lg transform hover:scale-105">
                    <Checkbox
                      id="user-generated"
                      checked={showUserGenerated}
                      onCheckedChange={(checked) => setShowUserGenerated(checked === true)}
                      className="border-3 border-orange-400 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded-lg w-5 h-5"
                    />
                    <label htmlFor="user-generated" className="text-lg font-bold text-orange-700 cursor-pointer select-none" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      ✍️ Пользовательские
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-green-100 rounded-full px-6 py-3 border-4 border-green-200 hover:border-green-400 transition-all shadow-lg transform hover:scale-105">
                    <Checkbox
                      id="ai-generated"
                      checked={showAIGenerated}
                      onCheckedChange={(checked) => setShowAIGenerated(checked === true)}
                      className="border-3 border-green-400 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 rounded-lg w-5 h-5"
                    />
                    <label htmlFor="ai-generated" className="text-lg font-bold text-green-700 cursor-pointer select-none" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      🤖 ИИ-сказки
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-purple-700 font-medium text-lg">Загрузка сказок...</p>
          </div>
        ) : filteredStories.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStories.map((story) => (
              <Card key={story.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-4 border-orange-200 rounded-3xl overflow-hidden transform hover:rotate-1">
                <div className="relative overflow-hidden">
                  <img 
                    src={getStoryImage(story)} 
                    alt={story.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant="secondary" 
                      className={`font-bold rounded-full px-3 py-1 border-2 shadow-lg ${
                        story.type.includes('Народные') 
                          ? 'bg-purple-100 border-purple-300 text-purple-700'
                          : story.type.includes('пользователями') || story.type.includes('Мои опубликованные')
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
                    {story.content.substring(0, 100)}...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-2 border-purple-300 text-purple-700 hover:bg-purple-100 rounded-full font-medium">
                        <BookOpen className="w-4 h-4 mr-1" />
                        Читать
                      </Button>
                      <TTSPlayer text={story.content} language={story.language} />
                    </div>
                    <div className="flex items-center gap-2">
                      {user && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleLike(story.id, story.source)}
                          className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-full p-2"
                        >
                          <Heart className={`w-5 h-5 ${isLiked(story.id, story.source === 'preloaded' ? 'folk' : story.source === 'user_generated' ? 'user' : 'ai') ? 'fill-current' : ''}`} />
                        </Button>
                      )}
                      <div className="flex items-center text-pink-600">
                        <Heart className="w-4 h-4 mr-1 fill-current" />
                        <span className="text-sm font-bold">{story.like_count}</span>
                      </div>
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
              <p className="text-purple-700 font-medium text-lg mb-4">
                {searchTerm ? 'Сказки не найдены' : 'Выберите категории для отображения'}
              </p>
              {searchTerm && (
                <p className="text-purple-500 text-sm">
                  Попробуйте изменить поисковый запрос или настройки фильтра
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
