import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Play, BookOpen, Search, Filter, Globe, Star, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFairytales } from "@/hooks/useFairytales";

const Library = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("все");
  const [selectedLanguage, setSelectedLanguage] = useState("все");
  const [selectedType, setSelectedType] = useState("все");
  
  const { user, signOut } = useAuth();
  const { fairytales, loading } = useFairytales();

  const genres = ["Все", "Фантастика", "Приключения", "Романтика", "Поучительная", "Комедия", "Мистика"];
  const languages = ["Все", "Русский", "Узбекский", "Английский"];
  const types = ["Все", "Народная", "Авторская"];

  // Transform fairytales data for display
  const stories = fairytales.map((fairytale, index) => ({
    id: fairytale.id,
    title: fairytale.title,
    genre: "Сказка",
    type: "Авторская",
    language: "Русский",
    likes: Math.floor(Math.random() * 200) + 50, // Random likes for now
    cover: `https://images.unsplash.com/photo-${
      index % 6 === 0 ? '1518709268805-4e9042af2176' :
      index % 6 === 1 ? '1544947950-fa07a98d237f' :
      index % 6 === 2 ? '1578662996442-48f60103fc96' :
      index % 6 === 3 ? '1551582045-6ec9c11d8697' :
      index % 6 === 4 ? '1600298881974-6be191ceeda1' :
      '1583212292454-1fe6229603b7'
    }?w=400&h=300&fit=crop`,
    description: fairytale.content.substring(0, 100) + "...",
    content: fairytale.content
  }));

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "все" || story.genre.toLowerCase() === selectedGenre.toLowerCase();
    const matchesLanguage = selectedLanguage === "все" || story.language.toLowerCase() === selectedLanguage.toLowerCase();
    const matchesType = selectedType === "все" || story.type.toLowerCase() === selectedType.toLowerCase();
    
    return matchesSearch && matchesGenre && matchesLanguage && matchesType;
  });

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 relative overflow-hidden">
      {/* Decorative elements */}
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

      {/* Header */}
      <header className="border-b-4 border-orange-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <BookOpen className="h-10 w-10 text-purple-600 transform rotate-12" />
              <Star className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 fill-current" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-purple-700" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                fAIrytales.uz
              </h1>
              <p className="text-sm text-purple-500 italic">Узбекские сказки с ИИ</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/library" className="text-orange-600 font-bold px-3 py-1 rounded-full border-2 border-orange-300 bg-orange-50">Каталог</Link>
            <Link to="/publish" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">Опубликовать сказку</Link>
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

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters with cartoon styling */}
          <div className="lg:w-1/4 space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-4 border-purple-200 rounded-3xl shadow-lg transform rotate-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  <Filter className="w-6 h-6 text-purple-600" />
                  Фильтры ✨
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                  <Input
                    placeholder="Поиск по названию..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-purple-200 rounded-full focus:border-purple-400 font-medium"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-bold text-purple-700 mb-2 block" style={{ fontFamily: 'Comic Sans MS, cursive' }}>Жанр</label>
                  <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                    <SelectTrigger className="border-2 border-orange-200 rounded-full focus:border-orange-400 font-medium">
                      <SelectValue placeholder="Выберите жанр" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-orange-200 rounded-2xl">
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre.toLowerCase()} className="font-medium">
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-bold text-purple-700 mb-2 block" style={{ fontFamily: 'Comic Sans MS, cursive' }}>Язык</label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="border-2 border-green-200 rounded-full focus:border-green-400 font-medium">
                      <SelectValue placeholder="Выберите язык" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-green-200 rounded-2xl">
                      {languages.map((language) => (
                        <SelectItem key={language} value={language.toLowerCase()} className="font-medium">
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-bold text-purple-700 mb-2 block" style={{ fontFamily: 'Comic Sans MS, cursive' }}>Тип</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="border-2 border-pink-200 rounded-full focus:border-pink-400 font-medium">
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-pink-200 rounded-2xl">
                      {types.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()} className="font-medium">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full border-2 border-red-300 text-red-700 hover:bg-red-100 rounded-full font-bold transform hover:scale-105 transition-all"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedGenre("все");
                    setSelectedLanguage("все");
                    setSelectedType("все");
                  }}
                >
                  Очистить Фильтры
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="mb-6">
              <h2 className="text-4xl font-bold text-purple-800 mb-2 transform -rotate-1" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Каталог Сказок 📚
              </h2>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200 p-4 inline-block">
                <p className="text-purple-700 font-medium">
                  {loading ? "Загрузка..." : `Показано ${filteredStories.length} из ${stories.length} сказок`}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-gray-200 p-8 mx-4 shadow-lg">
                  <p className="text-purple-700 font-medium text-lg">Загрузка сказок...</p>
                </div>
              </div>
            ) : filteredStories.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredStories.map((story, index) => (
                  <Card key={story.id} className={`group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-4 border-orange-200 rounded-3xl overflow-hidden transform ${index % 2 === 0 ? 'hover:rotate-1' : 'hover:-rotate-1'}`}>
                    <div className="relative overflow-hidden">
                      <img 
                        src={story.cover} 
                        alt={story.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-purple-100 border-2 border-purple-300 text-purple-700 font-bold rounded-full px-3 py-1">
                          {story.type}
                        </Badge>
                      </div>
                      <div className="absolute top-3 left-3">
                        <div className="bg-yellow-400 rounded-full p-2 border-2 border-yellow-500">
                          <Star className="w-4 h-4 text-yellow-800 fill-current" />
                        </div>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl group-hover:text-purple-600 transition-colors font-bold" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                        {story.title}
                      </CardTitle>
                      <CardDescription className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="border-2 border-green-300 text-green-700 rounded-full font-medium">
                          {story.genre}
                        </Badge>
                        <span className="text-sm text-purple-600 font-medium">{story.language}</span>
                      </CardDescription>
                      <p className="text-sm text-purple-700 line-clamp-2 font-medium">
                        {story.description}
                      </p>
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
                          <span className="text-sm font-bold">{story.likes}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-gray-200 p-8 mx-4 shadow-lg">
                  <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-600 mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    Сказки не найдены 😔
                  </h3>
                  <p className="text-gray-500 font-medium mb-4">Попробуйте изменить фильтры или поисковый запрос</p>
                  <Link to="/publish">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full border-4 border-purple-300 shadow-lg transform hover:scale-105 transition-all font-bold">
                      Опубликовать сказку
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;
