import { useEffect, useState } from 'react'
import { getPoll } from '../services/api'

export function usePoll(id) {
  const [state, setState] = useState({
    poll: null,
    error: null,
    resolvedId: null,
  })

  useEffect(() => {
    if (!id) return

    let cancelled = false

    getPoll(id)
      .then((data) => {
        if (!data) throw new Error('Poll not found')
        if (!cancelled) {
          setState({
            poll: data,
            error: null,
            resolvedId: id,
          })
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            poll: null,
            error: err.message || 'Failed to load poll',
            resolvedId: id,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return {
    poll: state.poll,
    error: state.error,
    loading: Boolean(id) && state.resolvedId !== id,
  }
}
