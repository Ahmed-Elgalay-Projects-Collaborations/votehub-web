import { useState, useEffect } from 'react'
import { getPoll } from '../services/api'

export function usePoll(id) {
  const [poll, setPoll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return;
    setLoading(true)
    getPoll(id)
      .then(data => {
        if (!data) throw new Error('Poll not found')
        setPoll(data)
      })
      .catch(err => setError(err.message || 'Failed to load poll'))
      .finally(() => setLoading(false))
  }, [id])

  return { poll, loading, error }
}
