import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Play, BookOpen, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFairytales } from "@/hooks/useFairytales";

const Library = () => {
  const { user, signOut } = useAuth();
  const { fairytales, userFairytales, aiFairytales, loading } = useFairytales();
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreloaded, setShowPreloaded] = useState(true);
  const [showUserGenerated, setShowUserGenerated] = useState(true);
  const [showAIGenerated, setShowAIGenerated] = useState(true);

  // Combine all stories for display
  const allStories = useMemo(() => {
    const stories = [];
    
    // Add preloaded fairytales
    if (showPreloaded) {
      stories.push(...fairytales.map(fairytale => ({
        id: fairytale.id,
        title: fairytale.title,
        content: fairytale.text_ru || fairytale.content || '',
        type: 'Народные сказки',
        source: 'preloaded'
      })));
    }
    
    // Add user-generated fairytales
    if (showUserGenerated) {
      stories.push(...userFairytales.map(fairytale => ({
        id: fairytale.id,
        title: fairytale.title,
        content: fairytale.content || '',
        type: 'Опубликованные пользователями',
        source: 'user_generated'
      })));
    }
    
    // Add AI-generated fairytales
    if (showAIGenerated) {
      stories.push(...aiFairytales.map(fairytale => ({
        id: fairytale.id,
        title: fairytale.title,
        content: fairytale.content || '',
        type: 'ИИ-сказки',
        source: 'ai_generated'
      })));
    }
    
    return stories;
  }, [fairytales, userFairytales, aiFairytales, showPreloaded, showUserGenerated, showAIGenerated]);

  // Filter stories based on search term
  const filteredStories = useMemo(() => {
    return allStories.filter(story =>
      story.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allStories, searchTerm]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handlePreloadedChange = (checked: boolean | "indeterminate") => {
    setShowPreloaded(checked === true);
  };

  const handleUserGeneratedChange = (checked: boolean | "indeterminate") => {
    setShowUserGenerated(checked === true);
  };

  const handleAIGeneratedChange = (checked: boolean | "indeterminate") => {
    setShowAIGenerated(checked === true);
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

            {/* Filter Checkboxes with improved styling */}
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-700">Фильтры:</span>
              </div>
              
              <div className="flex items-center space-x-2 bg-purple-50 rounded-full px-4 py-2 border-2 border-purple-200 hover:border-purple-400 transition-colors">
                <Checkbox
                  id="preloaded"
                  checked={showPreloaded}
                  onCheckedChange={handlePreloadedChange}
                  className="border-2 border-purple-400 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 rounded-md"
                />
                <label htmlFor="preloaded" className="text-sm font-bold text-purple-700 cursor-pointer" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  🏰 Народные сказки
                </label>
              </div>

              <div className="flex items-center space-x-2 bg-orange-50 rounded-full px-4 py-2 border-2 border-orange-200 hover:border-orange-400 transition-colors">
                <Checkbox
                  id="user-generated"
                  checked={showUserGenerated}
                  onCheckedChange={handleUserGeneratedChange}
                  className="border-2 border-orange-400 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded-md"
                />
                <label htmlFor="user-generated" className="text-sm font-bold text-orange-700 cursor-pointer" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  ✍️ Опубликованные пользователями
                </label>
              </div>

              <div className="flex items-center space-x-2 bg-green-50 rounded-full px-4 py-2 border-2 border-green-200 hover:border-green-400 transition-colors">
                <Checkbox
                  id="ai-generated"
                  checked={showAIGenerated}
                  onCheckedChange={handleAIGeneratedChange}
                  className="border-2 border-green-400 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 rounded-md"
                />
                <label htmlFor="ai-generated" className="text-sm font-bold text-green-700 cursor-pointer" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  🤖 ИИ-сказки
                </label>
              </div>
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
                  <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white opacity-80" />
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
                    {story.content.substring(0, 100)}...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-2 border-purple-300 text-purple-700 hover:bg-purple-100 rounded-full font-medium">
                        <BookOpen className="w-4 h-4 mr-1" />
                        Читать
                      </Button>
                      <Button size="sm" variant="outline" className="border-2 border-green-300 text-green-700 hover:bg-green-100 rounded-full font-medium">
                        <Play className="w-4 h-4 mr-1" />
                        Слушать
                      </Button>
                    </div>
                    <div className="flex items-center text-pink-600">
                      <Heart className="w-5 h-5 mr-1 fill-current" />
                      <span className="text-sm font-bold">{Math.floor(Math.random() * 200) + 50}</span>
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
