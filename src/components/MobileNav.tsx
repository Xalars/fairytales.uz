
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { BookOpen, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Mobile menu */}
      <div className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-orange-200">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-purple-600 transform rotate-12" />
              <span className="font-comic-title text-lg text-purple-700">fAIrytales.uz</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-purple-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-4">
            <Link 
              to="/library" 
              className="block w-full text-left p-3 text-purple-700 hover:text-orange-600 transition-colors font-comic-medium rounded-xl border-2 border-transparent hover:border-orange-300 hover:bg-orange-50"
              onClick={onClose}
            >
              📚 Каталог
            </Link>
            <Link 
              to="/publish" 
              className="block w-full text-left p-3 text-purple-700 hover:text-orange-600 transition-colors font-comic-medium rounded-xl border-2 border-transparent hover:border-orange-300 hover:bg-orange-50"
              onClick={onClose}
            >
              ✍️ Опубликовать сказку
            </Link>
            <Link 
              to="/ai-fairytales" 
              className="block w-full text-left p-3 text-purple-700 hover:text-orange-600 transition-colors font-comic-medium rounded-xl border-2 border-transparent hover:border-orange-300 hover:bg-orange-50"
              onClick={onClose}
            >
              🤖 ИИ-сказки
            </Link>
            {user && (
              <Link 
                to="/profile" 
                className="block w-full text-left p-3 text-purple-700 hover:text-orange-600 transition-colors font-comic-medium rounded-xl border-2 border-transparent hover:border-orange-300 hover:bg-orange-50"
                onClick={onClose}
              >
                👤 Профиль
              </Link>
            )}
          </nav>

          {/* Auth section */}
          <div className="p-4 border-t border-orange-200">
            {user ? (
              <div className="space-y-3">
                <p className="text-sm text-purple-600 font-comic-medium text-center">
                  Добро пожаловать!
                </p>
                <Button 
                  onClick={handleSignOut}
                  variant="outline" 
                  className="w-full border-2 border-purple-400 text-purple-700 hover:bg-purple-100 rounded-full font-comic-medium btn-mobile"
                >
                  Выйти
                </Button>
              </div>
            ) : (
              <Link to="/auth" onClick={onClose}>
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-purple-400 text-purple-700 hover:bg-purple-100 rounded-full font-comic-medium btn-mobile"
                >
                  Войти
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
