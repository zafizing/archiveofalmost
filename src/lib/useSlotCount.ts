import { useState, useEffect } from 'react';
import { supabase } from './supabase';

const TOTAL_SLOTS = 250;

export function useSlotCount() {
  const [archived, setArchived] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      const { count } = await supabase
        .from('exhibits')
        .select('*', { count: 'exact', head: true });
      if (count !== null) setArchived(count);
    }
    fetchCount();
  }, []);

  const remaining = archived !== null ? TOTAL_SLOTS - archived : null;
  return { archived, remaining, total: TOTAL_SLOTS };
}
