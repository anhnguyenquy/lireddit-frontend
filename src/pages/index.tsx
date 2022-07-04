import { DeleteIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, Heading, IconButton, Link, Stack, Text } from '@chakra-ui/react'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import NextLink from 'next/link'
import { useState } from 'react'
import { Layout, UpdootSection } from '../components'
import { useDeletePostMutation, usePostsQuery } from '../generated/graphql'
import { useUser } from '../hooks'
import { createURQLClient } from '../utils'

const Index: NextPage = () => {
  const [variables, setVariables] = useState<{ limit: number, cursor: string | null }>
    ({ limit: 15, cursor: null })
  const [{ data, fetching }] = usePostsQuery({ variables })
  const [, deletePost] = useDeletePostMutation()
  const user = useUser()
  return (
    <Layout>
      {
        !data && fetching ? <div>loading...</div> :
          <Stack spacing={8} mb={8}>
            {
              data?.posts?.posts.map(p =>
                <Flex key={p.id} p={5} shadow='md' borderWidth='1px'>
                  <UpdootSection post={p} />
                  <Flex alignItems='center' flex={1}>
                    <Box>
                      <NextLink href='/post/[id]' as={`/post/${p.id}`} >
                        <Link>
                          <Heading fontSize='xl'>{p.title}</Heading>
                        </Link>
                      </NextLink>
                      <Text>posted by {p.creator.username}</Text>
                      <Text mt={4}>{p.textSnippet}</Text>
                    </Box>
                    {
                      user?.id === p.creator.id &&
                      <IconButton
                        ml='auto'
                        color='red.500'
                        bg='transparent'
                        icon={<DeleteIcon />}
                        aria-label='delete'
                        onClick={async () => {
                          await deletePost({ id: p.id })
                        }}
                      />
                    }
                  </Flex>
                </Flex>
              )
            }
          </Stack>
      }
      {
        data?.posts?.hasMore &&
        <Flex>
          <Button
            onClick={() => { // Get the next <limit> posts before the chronologically last post
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
              })
            }}
            isLoading={fetching}
            m='auto'
            my={8}
          >
            Load more
          </Button>
        </Flex>
      }
    </Layout>
  )
}

/* 
  - withUrqlClient(createURQLClient) has to be wrapped around any page that uses URQL
  i.e. any query/mutation hooks
  - if ssr is enabled, any urql queries/mutations 
  (in this case usePostsQuery() and useMeQuery() inside <NavBar />) 
  will be executed on the server. As such, data in [{ data }] will always be defined
  and <div>loading...</div> will never be rendered.
  - SSR is only enabled on initial page load. If, for instance, the user first navigates to
  index (SSR), then to login and then go back, index will be CSR 
  i.e. <div>loading...</div> will be shown again.
*/
export default withUrqlClient(createURQLClient, { ssr: true })(Index)