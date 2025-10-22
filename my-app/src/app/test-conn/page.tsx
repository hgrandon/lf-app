'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient' // ✅ Importa correctamente el cliente desde la carpeta lib

export default function TestConn() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'fail'>('loading')
  const [details, setDetails] = useState<string>('')

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { count, error } = await supabase
          .from('clientes') // 👈 cambia el nombre si tu tabla es diferente
          .select('*', { count: 'exact', head: true })

        if (error) throw error

        setStatus('ok')
        setDetails(`✅ Conexión correcta. Filas visibles: ${count ?? 0}`)
      } catch (e: any) {
        setStatus('fail')
        setDetails(`❌ Error Supabase: ${e.message}`)
      }
    }

    testConnection()
  }, [])

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
      <pre>{details}</pre>
    </main>
  )
}

