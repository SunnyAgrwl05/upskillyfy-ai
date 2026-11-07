import { useLayoutEffect, useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

const positions = new Map()

export default function ScrollRestoration() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const previousKey = useRef(location.key)

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      const previous = window.history.scrollRestoration
      window.history.scrollRestoration = 'manual'
      return () => {
        window.history.scrollRestoration = previous
      }
    }
    return undefined
  }, [])

  useEffect(() => {
    const savePosition = () => {
      positions.set(location.key, [window.scrollX, window.scrollY])
    }

    window.addEventListener('scroll', savePosition, { passive: true })
    return () => {
      savePosition()
      window.removeEventListener('scroll', savePosition)
    }
  }, [location.key])

  useLayoutEffect(() => {
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1))
      if (target) {
        target.scrollIntoView()
        return
      }
    }

    if (navigationType === 'POP') {
      const position = positions.get(location.key)
      if (position) {
        window.scrollTo(position[0], position[1])
      }
    } else if (previousKey.current !== location.key) {
      window.scrollTo(0, 0)
    }

    previousKey.current = location.key
  }, [location.hash, location.key, navigationType])

  return null
}
