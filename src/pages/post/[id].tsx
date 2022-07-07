import { Box, Flex, Heading } from '@chakra-ui/react'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import { EditDeletePostButtons, Layout } from 'src/components'
import { useGetPostFromURL } from 'src/hooks'
import { createURQLClient } from 'src/utils'

interface PostProps {

}

const Post: NextPage<PostProps> = () => {
  const router = useRouter()
  const [{ data, error, fetching }] = useGetPostFromURL()
  if (fetching) {
    return <>loading...</>
  }

  if (error) {
    console.log(error)
    return <>{error.message}</>
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Post not found.</Box>
      </Layout>
    )
  }

  return (
    <Layout>
      <Heading mb={4}>{data.post.title}</Heading>
      <Box>{data.post.text}</Box>
      <Flex w='calc(80px + 0.5rem)' mt={4} justifyContent='space-between'>
        <EditDeletePostButtons id={data.post.id} />
      </Flex>
    </Layout>
  )
}

export default withUrqlClient(createURQLClient, { ssr: true })(Post)