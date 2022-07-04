import { Box, Button } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import { InputField, Layout } from '../components'
import { useCreatePostMutation } from '../generated/graphql'
import { useIsAuth } from '../hooks'
import { createURQLClient } from '../utils'

interface CreatePostProps {

}

const CreatePost: NextPage<CreatePostProps> = () => {
  const router = useRouter()
  useIsAuth({ autoRedirect: true })
  const [, createPost] = useCreatePostMutation()
  return (
    <Layout variant='small'>
      <Formik
        initialValues={{ title: '', text: '' }}
        onSubmit={async (values, { setErrors }) => {
          const { error } = await createPost({ input: values })
          if (!error) {
            router.push('/')
          }
        }}
      >
        {({ isSubmitting }) =>
          <Form>
            <InputField name='title' placeholder='title' label='Title' />
            <Box mt={4}>
              <InputField name='text' placeholder='text...' label='Body' textarea />
            </Box>
            <Button
              type='submit'
              isLoading={isSubmitting}
              mt={4}
              bgColor='teal'
              color='white'
            >
              Create Post
            </Button>
          </Form>
        }
      </Formik>
    </Layout>
  )
}

export default withUrqlClient(createURQLClient, { ssr: true })(CreatePost)