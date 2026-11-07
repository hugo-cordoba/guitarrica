import { useCallback, useEffect, useState } from 'react'
import { Loader } from '@/components/Loader'
import { Site } from '@/components/Site'

export default function App() {
  const [ready, setReady] = useState(false)
  const done = useCallback(() => {
    window.scrollTo(0, 0)
    setReady(true)
  }, [])

  // Bloquea el scroll mientras dura el loader
  useEffect(() => {
    document.documentElement.style.overflow = ready ? '' : 'hidden'
  }, [ready])

  return (
    <>
      {!ready && <Loader onDone={done} />}
      <Site ready={ready} />
    </>
  )
}
