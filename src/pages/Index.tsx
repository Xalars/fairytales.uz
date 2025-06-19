
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useFairytales } from "@/hooks/useFairytales";

const Index = () => {
  const { fairytales, loading } = useFairytales();

  // Get emoji for different types and languages
  const getEmoji = (type: string | null, language: string | null) => {
    if (type === "ИИ" || type === "AI") return "🤖";
    if (language === "uz") return "👨‍🎓";
    if (language === "en") return "🧞‍♂️";
    return "🐠";
  };

  const topFairytales = fairytales.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-pink-50 to-purple-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-amber-800 mb-4" style={{
            fontFamily: 'Comic Sans MS, cursive',
            textShadow: '3px 3px 6px rgba(0,0,0,0.2)',
            transform: 'rotate(-2deg)'
          }}>
            ✨ fAIrytales.uz ✨
          </h1>
          <p className="text-2xl text-amber-700 mb-8 font-semibold" style={{
            fontFamily: 'Comic Sans MS, cursive'
          }}>
            Узбекские сказки с ИИ: читайте, слушайте, создавайте
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/library">
              <Button 
                size="lg" 
                className="text-xl px-8 py-4 rounded-2xl border-4 border-green-400 bg-gradient-to-r from-green-300 to-emerald-300 hover:from-green-400 hover:to-emerald-400 text-green-900 font-bold transition-all transform hover:scale-105 hover:rotate-1"
                style={{
                  boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255,255,255,0.6)',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                📖 Начать читать
              </Button>
            </Link>
            
            <Button 
              size="lg" 
              className="text-xl px-8 py-4 rounded-2xl border-4 border-purple-400 bg-gradient-to-r from-purple-300 to-pink-300 hover:from-purple-400 hover:to-pink-400 text-purple-900 font-bold transition-all transform hover:scale-105 hover:rotate-1"
              style={{
                boxShadow: '0 8px 25px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255,255,255,0.6)',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              🤖 Сгенерировать свою сказку
            </Button>
          </div>
        </div>

        {/* Decorative illustrations */}
        <div className="flex justify-center space-x-8 mb-16">
          <div className="text-6xl animate-bounce">🐰</div>
          <div className="text-6xl animate-bounce" style={{animationDelay: '0.5s'}}>🦋</div>
          <div className="text-6xl animate-bounce" style={{animationDelay: '1s'}}>🌟</div>
        </div>
      </div>

      {/* Featured Stories Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-amber-800 text-center mb-12" style={{
          fontFamily: 'Comic Sans MS, cursive',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}>
          🌟 Топ сказок
        </h2>
        
        {loading ? (
          <div className="text-center">
            <div className="text-2xl text-amber-800 font-bold">⏳ Загрузка...</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {topFairytales.map((fairytale) => (
              <Card key={fairytale.id} className="rounded-3xl border-4 border-amber-300 transform hover:scale-105 transition-all duration-300 hover:rotate-1" style={{
                background: 'linear-gradient(145deg, #fff8e1, #ffeaa7)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}>
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{getEmoji(fairytale.type, fairytale.language)}</div>
                  <CardTitle className="text-xl font-bold text-amber-800" style={{fontFamily: 'Comic Sans MS, cursive'}}>
                    {fairytale.title || 'Без названия'}
                  </CardTitle>
                  <CardDescription className="text-amber-600">
                    <span className="bg-amber-200 px-2 py-1 rounded-full text-xs font-semibold">
                      {fairytale.language?.toUpperCase() || 'RU'}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" variant="outline" className="rounded-xl border-2 border-blue-400 text-blue-600 hover:bg-blue-50">
                      📖 Читать
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-xl border-2 border-green-400 text-green-600 hover:bg-green-50">
                      🎧 Слушать
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-xl border-2 border-red-400 text-red-600 hover:bg-red-50">
                      ❤️
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* New Stories Section */}
      <div className="container mx-auto px-4 py-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl mx-4 mb-8" style={{
        boxShadow: 'inset 0 0 50px rgba(168, 85, 247, 0.1)'
      }}>
        <h2 className="text-4xl font-bold text-purple-800 text-center mb-8" style={{
          fontFamily: 'Comic Sans MS, cursive',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}>
          ✨ Новые сказки
        </h2>
        
        <div className="text-center">
          <p className="text-lg text-purple-700 mb-6">
            Свежие истории добавляются каждую неделю!
          </p>
          <Button className="rounded-xl border-3 border-purple-400 bg-gradient-to-r from-purple-300 to-pink-300 hover:from-purple-400 hover:to-pink-400 text-purple-900 font-bold">
            🆕 Посмотреть новинки
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
