
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Play, BookOpen, Sparkles, Globe, Users, Star, Moon } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const featuredStories = [
    {
      id: 1,
      title: "Принцесса Луны",
      genre: "Фантастика",
      origin: "Узбекская",
      language: "Русский",
      likes: 124,
      cover: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Умный Заяц",
      genre: "Поучительная",
      origin: "Узбекская",
      language: "Русский",
      likes: 89,
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Волшебный Ковёр",
      genre: "Приключения",
      origin: "Узбекская",
      language: "Русский",
      likes: 156,
      cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
    }
  ];

  const trendingGenres = ["Фантастика", "Приключения", "Романтика", "Поучительная", "Комедия", "Мистика"];

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

      {/* Header with hand-drawn style */}
      <header className="border-b-4 border-orange-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
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
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/library" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">
              Каталог
            </Link>
            <Link to="/ai-stories" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">
              ИИ Сказки
            </Link>
            <Link to="/generator" className="text-purple-700 hover:text-orange-600 transition-colors font-medium px-3 py-1 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-orange-50">
              Создать
            </Link>
          </nav>
          <Button 
            variant="outline" 
            className="border-2 border-purple-400 text-purple-700 hover:bg-purple-100 rounded-full px-6 py-2 font-medium transform hover:scale-105 transition-all"
          >
            Войти
          </Button>
        </div>
      </header>

      {/* Hero Section with cartoon styling */}
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
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full border-4 border-purple-300 shadow-lg transform hover:scale-105 transition-all font-bold"
            >
              <BookOpen className="w-6 h-6 mr-2" />
              Начать читать
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-4 border-orange-400 text-orange-700 hover:bg-orange-100 px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all font-bold"
            >
              <Sparkles className="w-6 h-6 mr-2" />
              Сгенерировать сказку
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Stories with cartoon cards */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h3 className="text-4xl font-bold text-purple-800 mb-4 transform -rotate-1" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Топ Сказок ⭐
          </h3>
          <div className="w-32 h-2 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mx-auto"></div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredStories.map((story) => (
            <Card key={story.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-4 border-orange-200 rounded-3xl overflow-hidden transform hover:rotate-1">
              <div className="relative overflow-hidden">
                <img 
                  src={story.cover} 
                  alt={story.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-white/95 border-2 border-purple-300 text-purple-700 font-bold rounded-full px-3 py-1">
                    <Globe className="w-3 h-3 mr-1" />
                    {story.origin}
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
                <CardDescription className="flex items-center justify-between">
                  <Badge variant="outline" className="border-2 border-orange-300 text-orange-700 rounded-full font-medium">
                    {story.genre}
                  </Badge>
                  <span className="text-sm text-purple-600 font-medium">{story.language}</span>
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
                    <span className="text-sm font-bold">{story.likes}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trending Genres with cartoon styling */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl border-4 border-pink-200 mx-4 p-8 shadow-lg transform -rotate-1">
          <h3 className="text-4xl font-bold text-purple-800 mb-8 text-center transform rotate-1" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Популярные Жанры 🌟
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {trendingGenres.map((genre, index) => (
              <Badge 
                key={genre} 
                variant="secondary" 
                className={`px-6 py-3 text-lg font-bold cursor-pointer transition-all transform hover:scale-110 rounded-full border-3 ${
                  index % 3 === 0 ? 'bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200' :
                  index % 3 === 1 ? 'bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200' :
                  'bg-pink-100 border-pink-300 text-pink-700 hover:bg-pink-200'
                }`}
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with cartoon elements */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-purple-200 p-8 shadow-lg transform rotate-1 hover:scale-105 transition-all">
            <div className="text-5xl font-bold text-purple-600 mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>200+</div>
            <div className="text-purple-700 font-medium text-lg">Узбекских Сказок</div>
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
                <li><Link to="/ai-stories" className="hover:text-yellow-400 transition-colors font-medium">ИИ Сказки</Link></li>
                <li><Link to="/recommendations" className="hover:text-yellow-400 transition-colors font-medium">Рекомендации</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg" style={{ fontFamily: 'Comic Sans MS, cursive' }}>Создавать</h4>
              <ul className="space-y-2 text-purple-200">
                <li><Link to="/generator" className="hover:text-yellow-400 transition-colors font-medium">ИИ Генератор</Link></li>
                <li><Link to="/publish" className="hover:text-yellow-400 transition-colors font-medium">Опубликовать</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg" style={{ fontFamily: 'Comic Sans MS, cursive' }}>Аккаунт</h4>
              <ul className="space-y-2 text-purple-200">
                <li><Link to="/profile" className="hover:text-yellow-400 transition-colors font-medium">Профиль</Link></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors font-medium">Настройки</a></li>
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
