import { Box, Button } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FormSuccessMessage, InputField, Layout } from 'src/components'
import { useCreatePostMutation } from 'src/generated/graphql'
import { useIsAuth } from 'src/hooks'
import { createURQLClient } from 'src/utils'

interface CreatePostProps {

}

const CreatePost: NextPage<CreatePostProps> = () => {
  useIsAuth(true)
  const router = useRouter()
  const [, createPost] = useCreatePostMutation()

  const [redirectCount, setRedirectCount] = useState(3)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  useEffect(() => {
    if (showSuccessMessage) {
      setInterval(() => {
        setRedirectCount(count => count - 1)
      }, 1000)
    }
  }, [showSuccessMessage])
  return (
    <Layout variant='small'>
      <Formik
        initialValues={{ title: '', text: '' }}
        onSubmit={async (values, { setErrors }) => {
          const { error } = await createPost({ input: values })
          if (!error) {
            setShowSuccessMessage(true)
            setTimeout(() => {
              router.push('/')
            }, 3050)
          }
        }}
      >
        {({ isSubmitting }) =>
          <Form>
            <InputField name='title' placeholder='title' label='Title' />
            <Box mt={4}>
              <InputField name='text' placeholder='text...' label='Body' textarea />
            </Box>
            {
              showSuccessMessage &&
              <FormSuccessMessage message={`Post created successfully. Redirecting to home page in ${redirectCount}`} />
            }
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