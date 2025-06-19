
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Ошибка входа",
              description: "Неверный email или пароль",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Ошибка",
              description: error.message,
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Добро пожаловать!",
            description: "Вы успешно вошли в систему"
          });
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes('User already registered')) {
            toast({
              title: "Пользователь уже существует",
              description: "Попробуйте войти в систему",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Ошибка регистрации",
              description: error.message,
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Регистрация успешна!",
            description: "Проверьте email для подтверждения аккаунта"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Произошла ошибка",
        description: "Попробуйте еще раз",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-pink-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border-4 border-amber-300" style={{
        background: 'linear-gradient(145deg, #fff8e1, #ffeaa7)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)'
      }}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-800 mb-2" style={{
            fontFamily: 'Comic Sans MS, cursive',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            ✨ fAIrytales.uz
          </h1>
          <p className="text-amber-700 text-lg">
            {isLogin ? 'Добро пожаловать обратно!' : 'Присоединяйтесь к нам!'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-amber-800 font-semibold mb-2 text-lg">
                Ваше имя
              </label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Введите ваше имя"
                className="w-full rounded-xl border-3 border-amber-400 text-lg p-4 focus:border-orange-400 transition-colors"
                style={{
                  background: 'linear-gradient(145deg, #ffffff, #fef7e0)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                }}
              />
            </div>
          )}
          
          <div>
            <label className="block text-amber-800 font-semibold mb-2 text-lg">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ваш@email.com"
              required
              className="w-full rounded-xl border-3 border-amber-400 text-lg p-4 focus:border-orange-400 transition-colors"
              style={{
                background: 'linear-gradient(145deg, #ffffff, #fef7e0)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
              }}
            />
          </div>

          <div>
            <label className="block text-amber-800 font-semibold mb-2 text-lg">
              Пароль
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
              className="w-full rounded-xl border-3 border-amber-400 text-lg p-4 focus:border-orange-400 transition-colors"
              style={{
                background: 'linear-gradient(145deg, #ffffff, #fef7e0)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
              }}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full text-xl py-4 rounded-xl border-4 border-orange-400 bg-gradient-to-r from-orange-300 to-amber-300 hover:from-orange-400 hover:to-amber-400 text-amber-900 font-bold transition-all transform hover:scale-105"
            style={{
              boxShadow: '0 6px 20px rgba(251, 146, 60, 0.4), inset 0 1px 0 rgba(255,255,255,0.6)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {loading ? '⏳ Загрузка...' : (isLogin ? '🚪 Войти' : '✨ Зарегистрироваться')}
          </Button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-amber-700 hover:text-orange-600 font-semibold text-lg underline decoration-wavy decoration-2 underline-offset-4 transition-colors"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрируйтесь!' : 'Уже есть аккаунт? Войдите!'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
