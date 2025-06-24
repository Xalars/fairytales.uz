import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Star, Heart, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';

interface Fairytale {
  id: string;
  title: string;
  description: string;
  content: string;
  created_at: string;
  like_count: number;
}

const Library = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const { data: folkFairytales, isLoading: isFolkLoading, error: folkError } = useQuery({
    queryKey: ['folkFairytales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('folk_fairytales')
        .select('*');
      if (error) throw error;
      return data as Fairytale[];
    },
  });

  const { data: userFairytales, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ['userFairytales', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_fairytales')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data as Fairytale[];
    },
    enabled: !!user,
  });

  const { data: aiFairytales, isLoading: isAiLoading, error: aiError } = useQuery({
    queryKey: ['aiFairytales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_fairytales')
        .select('*');
      if (error) throw error;
      return data as Fairytale[];
    },
  });

  const isLoading = isFolkLoading || isUserLoading || isAiLoading;
  const hasError = folkError || userError || aiError;

  const allFairytales = [
    ...(folkFairytales || []),
    ...(userFairytales || []),
    ...(aiFairytales || [])
  ];

  const filteredFairytales = allFairytales.filter(fairytale =>
    fairytale.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fairytale.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading fairytales...</div>;
  }

  if (hasError) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error loading fairytales.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 relative overflow-hidden flex flex-col items-center justify-start pt-20">
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

      <div className="w-full max-w-4xl p-6">
        <Card className="bg-white/90 backdrop-blur-sm border-4 border-purple-200 rounded-3xl shadow-2xl transform rotate-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <BookOpen className="h-16 w-16 text-purple-600 transform rotate-12" />
                <Star className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 fill-current" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-purple-800 mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Библиотека сказок
            </CardTitle>
            <CardDescription className="text-purple-600 text-lg font-medium">
              Выберите сказку для чтения
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="search" className="text-purple-700 font-bold text-sm">Поиск сказки</Label>
              <Input
                id="search"
                type="text"
                placeholder="Начните вводить название или описание..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-2 border-purple-200 rounded-full focus:border-purple-400 font-medium"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFairytales.map((fairytale) => (
                <Link key={fairytale.id} to={`/story/${fairytale.hasOwnProperty('user_id') ? 'user_generated' : fairytale.hasOwnProperty('ai_model') ? 'ai_generated' : 'folk'}/${fairytale.id}`}>
                  <Card className="bg-purple-50 hover:bg-purple-100 transition-colors duration-200 border-2 border-purple-200 rounded-xl shadow-md transform hover:scale-105">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-purple-700">{fairytale.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-purple-500">{fairytale.description.substring(0, 100)}...</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            {filteredFairytales.length === 0 && (
              <div className="text-center mt-4 text-purple-500">
                Нет сказок, соответствующих вашему запросу.
              </div>
            )}
            <div className="mt-6 text-center">
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

export default Library;
