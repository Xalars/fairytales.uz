
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        variant: "destructive"
      });
    } else {
      toast({
        title: "До свидания!",
        description: "Вы успешно вышли из системы"
      });
      navigate('/');
    }
  };

  return (
    <header className="bg-gradient-to-r from-orange-200 via-amber-200 to-yellow-200 border-b-4 border-amber-300 shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-3xl">🧚‍♀️</span>
          <h1 className="text-2xl font-bold text-amber-800" style={{
            fontFamily: 'Comic Sans MS, cursive',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            fAIrytales.uz
          </h1>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-amber-800 hover:text-orange-600 font-semibold text-lg transition-colors"
          >
            🏠 Главная
          </Link>
          <Link 
            to="/library" 
            className="text-amber-800 hover:text-orange-600 font-semibold text-lg transition-colors"
          >
            📚 Библиотека
          </Link>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-amber-800 font-semibold">
                👋 Привет, {user.email?.split('@')[0]}!
              </span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="rounded-xl border-2 border-orange-400 bg-white hover:bg-orange-50 text-orange-600 font-semibold transition-all"
              >
                🚪 Выйти
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button 
                className="rounded-xl border-3 border-orange-400 bg-gradient-to-r from-orange-300 to-amber-300 hover:from-orange-400 hover:to-amber-400 text-amber-900 font-bold transition-all transform hover:scale-105"
                style={{
                  boxShadow: '0 4px 12px rgba(251, 146, 60, 0.3)',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                🔑 Войти
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
