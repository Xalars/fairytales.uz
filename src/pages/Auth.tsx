
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Star, Heart, Users } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(mode !== 'signup');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Перенаправляем аутентифицированных пользователей
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (mode === 'signup') {
      setIsLogin(false);
    }
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        toast({
          title: "Ошибка",
          description: error.message,
          variant: "destructive",
        });
      } else {
        if (isLogin) {
          toast({
            title: "Успешно!",
            description: "Вы вошли в систему",
          });
          navigate("/");
        } else {
          toast({
            title: "Успешно!",
            description: "Проверьте email для подтверждения регистрации",
          });
        }
      }
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Что-то пошло не так",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 relative overflow-hidden flex items-center justify-center">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 opacity-20">
        <div className="w-20 h-12 bg-white rounded-full"></div>
        <div className="w-16 h-10 bg-white rounded-full -mt-6 ml-4"></div>
      </div>
      <div className="absolute top-20 right-20 opacity-30">
        <Star className="w-8 h-8 text-yellow-400 fill-current" />
      </div>
      <div className="absolute bottom-20 left-20 opacity-20">
        <Heart className="w-12 h-12 text-pink-300 fill-current" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-30">
        <Users className="w-10 h-10 text-purple-400" />
      </div>

      <div className="w-full max-w-md p-6">
        <Card className="bg-white/90 backdrop-blur-sm border-4 border-purple-200 rounded-3xl shadow-2xl transform rotate-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <BookOpen className="h-16 w-16 text-purple-600 transform rotate-12" />
                <Star className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 fill-current" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-purple-800 mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              {isLogin ? "Добро пожаловать!" : "Присоединяйтесь!"}
            </CardTitle>
            <CardDescription className="text-purple-600 text-lg font-medium">
              {isLogin ? "Войдите в мир сказок" : "Создайте аккаунт для создания сказок"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-purple-700 font-bold text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 border-purple-200 rounded-full focus:border-purple-400 font-medium"
                  placeholder="ваш@email.com"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-purple-700 font-bold text-sm">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-2 border-purple-200 rounded-full focus:border-purple-400 font-medium"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full border-4 border-purple-300 shadow-lg transform hover:scale-105 transition-all font-bold py-3"
              >
                {loading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-purple-600 hover:text-orange-600 transition-colors font-medium"
                disabled={loading}
              >
                {isLogin ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Войти"}
              </button>
            </div>
            <div className="mt-4 text-center">
              <Link 
                to="/" 
                className="text-orange-600 hover:text-purple-600 transition-colors font-medium"
              >
                ← Вернуться на главную
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
