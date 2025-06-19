
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFairytales } from "@/hooks/useFairytales";

const Library = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  const { fairytales, loading } = useFairytales();

  // Get emoji for different types and languages
  const getEmoji = (type: string | null, language: string | null) => {
    if (type === "ИИ" || type === "AI") return "🤖";
    if (language === "uz") return "👨‍🎓";
    if (language === "en") return "🧞‍♂️";
    return "🐠";
  };

  const filteredStories = fairytales.filter(story => {
    const matchesSearch = story.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesLanguage = languageFilter === "all" || story.language === languageFilter;
    const matchesType = typeFilter === "all" || 
      (typeFilter === "folk" && (story.type === "Народная" || story.type === "Folk")) ||
      (typeFilter === "ai" && (story.type === "ИИ" || story.type === "AI"));
    
    return matchesSearch && matchesLanguage && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-pink-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-amber-800 mb-4" style={{
            fontFamily: 'Comic Sans MS, cursive',
            textShadow: '3px 3px 6px rgba(0,0,0,0.2)'
          }}>
            📚 Каталог сказок
          </h1>
          <p className="text-xl text-amber-700" style={{fontFamily: 'Comic Sans MS, cursive'}}>
            Найдите идеальную сказку для себя
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl border-4 border-amber-300 p-6 mb-8" style={{
          background: 'linear-gradient(145deg, #fff8e1, #ffeaa7)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-amber-800 font-semibold mb-2">🔍 Поиск</label>
              <Input
                placeholder="Поиск по названию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-xl border-3 border-amber-400 focus:border-orange-400"
                style={{
                  background: 'linear-gradient(145deg, #ffffff, #fef7e0)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                }}
              />
            </div>

            {/* Language Filter */}
            <div>
              <label className="block text-amber-800 font-semibold mb-2">🌍 Язык</label>
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="rounded-xl border-3 border-amber-400" style={{
                  background: 'linear-gradient(145deg, #ffffff, #fef7e0)'
                }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все языки</SelectItem>
                  <SelectItem value="uz">🇺🇿 Узбекский</SelectItem>
                  <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                  <SelectItem value="en">🇬🇧 Английский</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-amber-800 font-semibold mb-2">📖 Тип</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="rounded-xl border-3 border-amber-400" style={{
                  background: 'linear-gradient(145deg, #ffffff, #fef7e0)'
                }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="folk">🏛️ Народные</SelectItem>
                  <SelectItem value="ai">🤖 ИИ сказки</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="text-2xl text-amber-800 font-bold">⏳ Загрузка сказок...</div>
          </div>
        )}

        {/* Stories Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => (
              <Card key={story.id} className="rounded-3xl border-4 border-amber-300 transform hover:scale-105 transition-all duration-300 hover:rotate-1 cursor-pointer" style={{
                background: 'linear-gradient(145deg, #fff8e1, #ffeaa7)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}>
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{getEmoji(story.type, story.language)}</div>
                  <CardTitle className="text-xl font-bold text-amber-800 mb-2" style={{fontFamily: 'Comic Sans MS, cursive'}}>
                    {story.title || 'Без названия'}
                  </CardTitle>
                  <CardDescription className="space-y-2">
                    <div className="flex justify-center gap-2">
                      <Badge 
                        variant={story.type === "Народная" || story.type === "Folk" ? "default" : "secondary"}
                        className="rounded-full"
                      >
                        {story.type === "Народная" || story.type === "Folk" ? "🏛️" : "🤖"} {story.type || "Неизвестно"}
                      </Badge>
                      <Badge variant="outline" className="rounded-full">
                        {story.language === "uz" ? "🇺🇿" : story.language === "ru" ? "🇷🇺" : "🇬🇧"} 
                        {story.language?.toUpperCase() || "RU"}
                      </Badge>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex gap-2 justify-center mb-3">
                    <Button size="sm" className="rounded-xl border-2 border-blue-400 bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                      📖 Читать
                    </Button>
                    <Button size="sm" className="rounded-xl border-2 border-green-400 bg-green-100 text-green-600 hover:bg-green-200 transition-colors">
                      🎧 Слушать
                    </Button>
                    <Button size="sm" className="rounded-xl border-2 border-gray-400 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                      🤍
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && filteredStories.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-2xl font-bold text-amber-800 mb-2">Сказки не найдены</h3>
            <p className="text-amber-600">Попробуйте изменить фильтры поиска</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
