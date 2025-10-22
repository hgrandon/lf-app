'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function TestConn() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'fail'>('loading')
  const [details, setDetails] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const { count, error } = await supabase
          .from('clientes')
          .select('*', { count: 'exact', head: true })
        if (error) throw error
        setStatus('ok')
        setDetails(`✅ Conexión correcta. Filas visibles: ${count ?? 0}`)
      } catch (e: any) {
        setStatus('fail')
        setDetails(`❌ Error Supabase: ${e.message}`)
      }
    })()
  }, [])

  return (
    <div style={{ padding: '30px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>Prueba de conexión Supabase</h1>
      <p>{details}</p>
      <p>Estado: <b>{status}</b></p>
    </div>
  )
}


