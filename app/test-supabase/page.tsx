import { supabase } from '../../lib/supabase'

export default async function TestSupabasePage() {
  const { data, error } = await supabase.from('stratas').select('*')

  return (
    <main style={{ padding: '24px' }}>
      <h1>Supabase Test</h1>

      {error && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      <pre style={{ whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  )
}