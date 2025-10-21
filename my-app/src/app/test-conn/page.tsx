'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestConn() {
  const [status, setStatus] = useState<'loading'|'ok'|'fail'>('loading');
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const { error, count } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true }); // solo cuenta filas

        if (error) {
          setStatus('fail');
          setDetails(`Error Supabase: ${error.message}`);
        } else {
          setStatus('ok');
          setDetails(`✅ Conexión correcta. Filas visibles (RLS activo): ${count ?? 0}`);
        }
      } catch (e: any) {
        setStatus('fail');
        setDetails(e?.message ?? 'Error desconocido');
      }
    })();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Prueba de conexión con Supabase</h1>
      <p>
        Estado:{' '}
        {status === 'loading'
          ? '⏳ Probando conexión...'
          : status === 'ok'
          ? '✅ Éxito'
          : '❌ Falló'}
      </p>
      <pre
        style={{
          background: '#f6f6f6',
          padding: 12,
          borderRadius: 8,
          whiteSpace: 'pre-wrap',
        }}
      >
        {details}
      </pre>
    </main>
  );
}
