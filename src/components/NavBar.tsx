import { Box, Button, Flex, Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useMeQuery, useLogoutMutation } from '../generated/graphql'

interface Props {

}

export const NavBar = (props: Props): JSX.Element => {
  const { } = props
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation()

  /*
    If the user was not logged in initially, URQL will cache the null data of the me query.
    As such, even when the user later logins, the navbar will not change immediately because
    it is still using the old cache. The change will be reflected only when the page is refreshed 
    because that's when the me query is run again with the session cookie. To resolve this behaviour, 
    we have to manually update the caching behaviour of URQL.
  */
  const [{ data, fetching }] = useMeQuery() // runs when component is mounted
  
  let body = null
  if (fetching) { }     // data is loading
  else if (!data?.me) { // user not logged in
    body =
      <>
        <NextLink href='/login'>
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href='/register'>
          <Link>Register</Link>
        </NextLink>
      </>
  }
  else {                // user logged in
    body =
      <Flex>
        <Box mr={2}>{data.me.username}</Box>
        <Button onClick={() => { logout() }} isLoading={logoutFetching} variant='link'>Logout</Button>
      </Flex>
  }

  return (
    <Flex bg='tan' p={4}>
      <Box ml='auto'>
        {body}
      </Box>
    </Flex>
  )
}