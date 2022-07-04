import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useMeQuery, useLogoutMutation } from '../generated/graphql'
import { isServer } from '../utils'
import { NoUnderlineLink } from './NoUnderlineLink'

interface NavBarProps {

}

export const NavBar = (props: NavBarProps): JSX.Element => {
  const { } = props
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation()

  /*
    - If the user was not logged in initially, URQL will cache the null data of the me query.
    As such, even when the user later logins, the navbar will not change immediately because
    it is still using the old cache. The change will be reflected only when the page is refreshed 
    because that's when the me query is run again with the session cookie. To resolve this behaviour, 
    we have to manually update the caching behaviour of URQL.
    - If SSR is enabled, disable the query because the cookie isn't set on the server and as such data will be null
    - URQL query hooks by default runs when component is mounted or on server if SSR is enabled.
  */
  const [{ data, fetching }] = useMeQuery({
    // pause: isServer(), // this can be removed even when SSR is enabled as the cookie is set on the server
  })

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
      <Flex alignItems='center'>
        <NextLink href='/create-post'>
          <Button as={NoUnderlineLink} mr={5}>
            Create Post
          </Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button onClick={() => { logout() }} isLoading={logoutFetching} variant='link'>Logout</Button>
      </Flex>
  }

  return (
    <Flex zIndex={2} position='sticky' top={0} bg='tan' p={4} >
      <Flex flex={1} m='auto' alignItems='center' maxW={800}>
        <NextLink href='/'>
          <Link>
            <Heading>LiReddit</Heading>
          </Link>
        </NextLink>
        <Box ml='auto'>
          {body}
        </Box>
      </Flex>
    </Flex>
  )
}