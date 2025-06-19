
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Fairytale {
  id: string;
  title: string | null;
  text_ru: string | null;
  language: string | null;
  type: string | null;
  created_at: string | null;
}

export const useFairytales = () => {
  const [fairytales, setFairytales] = useState<Fairytale[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFairytales = async () => {
      try {
        const { data, error } = await supabase
          .from('Fairytales')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setFairytales(data || []);
      } catch (error) {
        console.error('Error fetching fairytales:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить сказки",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFairytales();
  }, [toast]);

  return { fairytales, loading };
};
