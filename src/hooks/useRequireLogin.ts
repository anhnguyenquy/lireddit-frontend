import { useEffect, useState } from 'react'
import { useIsAuth } from './useIsAuth'
import { useUser } from './useUser'

export const useRequireLogin = () => {
  const { redirectLogin } = useIsAuth(false)
  const [requiring, setRequiring] = useState(false)
  const user = useUser()

  useEffect(() => {
    if (requiring && !user) {
      redirectLogin()
    }
  }, [requiring])

  const requireLogin = () => {
    setRequiring(true)
  }

  return requireLogin
}