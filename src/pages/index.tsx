import { Box, Button, Flex, Heading, Link, Stack, Text } from '@chakra-ui/react'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import NextLink from 'next/link'
import { useState } from 'react'
import { EditDeletePostButtons, Layout, UpdootSection } from 'src/components'
import { usePostsQuery } from 'src/generated/graphql'
import { useUser } from 'src/hooks'
import { createURQLClient } from 'src/utils'

const Index: NextPage = () => {
  const [variables, setVariables] = useState<{ limit: number, cursor: string | null }>
    ({ limit: 15, cursor: null })
  const [{ data, fetching }] = usePostsQuery({ variables })
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
                      user?.id == p.creator.id &&
                      <Flex flexDir='column' justifyContent='space-between' ml='auto' height='calc(80px + 0.25rem)'>
                        <EditDeletePostButtons id={p.id} />
                      </Flex>
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
  - If SSR is enabled, any urql queries/mutations 
  (in this case usePostsQuery() and useMeQuery() inside <NavBar />) 
  will be executed on the server. As such, data in [{ data }] will always be defined
  and <div>loading...</div> will never be rendered.
  - SSR is only enabled on initial page load. If, for instance, the user first navigates to
  index (SSR), then to login and then go back, index will be CSR 
  i.e. <div>loading...</div> will be shown again.
*/
export default withUrqlClient(createURQLClient, { ssr: true })(Index)