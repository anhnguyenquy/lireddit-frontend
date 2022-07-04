import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useMeQuery } from '../generated/graphql'

interface useIsAuthProps {
  autoRedirect: boolean
}

export const useIsAuth = (props: useIsAuthProps) => {
  const { autoRedirect } = props
  const [{ data, fetching }] = useMeQuery()
  const router = useRouter()

  const redirectLogin = () => {
    // router.pathname is the current page.
    // by passing it to login, login would know where to redirect to after login.
    router.replace('/login?next=' + router.pathname)
  }

  useEffect(() => {
    if (!fetching && !data?.me && autoRedirect) {
      redirectLogin()
    }
  }, [data, router, fetching])

  return {
    redirectLogin
  }
}