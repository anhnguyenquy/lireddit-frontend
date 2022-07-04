import { Box, Heading } from '@chakra-ui/react'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Layout } from '../../components'
import { usePostQuery } from '../../generated/graphql'
import { createURQLClient } from '../../utils'

interface PostProps {

}

const Post: NextPage<PostProps> = () => {
  const router = useRouter()
  const intId = typeof router.query.id == 'string' ? parseInt(router.query.id as string) : -1
  const [{ data, error, fetching }] = usePostQuery({
    pause: intId == -1,
    variables: {
      id: intId
    }
  })

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
      <Heading>{data.post.title}</Heading>
      {data.post.text}
    </Layout>
  )
}

export default withUrqlClient(createURQLClient, { ssr: true })(Post)