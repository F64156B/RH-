import { useEffect, useState } from 'react';
import { listen, where } from './firestore';
import type { Vaga } from './types';
import { useAuth } from './auth';

export function useApprovalsCount(): number {
  const { user, isAdmin } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }
    const email = user.email?.toLowerCase() ?? '';
    return listen<Vaga>(
      'vagas',
      (rows) => {
        if (isAdmin) setCount(rows.length);
        else setCount(rows.filter((v) => v.approverEmail?.toLowerCase() === email).length);
      },
      where('status', '==', 'pendente'),
    );
  }, [user, isAdmin]);

  return count;
}
