import { ArrowBackIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, IconButton } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FormSuccessMessage, InputField, Layout } from '../../../components'
import { useUpdatePostMutation } from '../../../generated/graphql'
import { useGetPostFromURL, useGetQueryID, useIsAuth } from '../../../hooks'
import { createURQLClient } from '../../../utils'

interface EditPostProps {

}

const EditPost: NextPage<EditPostProps> = () => {
  useIsAuth(true)
  const router = useRouter()
  const id = useGetQueryID()
  const [{ data }] = useGetPostFromURL()
  const [, updatePost] = useUpdatePostMutation()
  const [justModified, setJustModified] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  useEffect(() => {
    if (showSuccessMessage) {
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
    }
  }, [showSuccessMessage])
  return data?.post?.title && data?.post?.text ?
    <Layout variant='small'>
      <Formik
        initialValues={{
          id: data.post.id,
          title: data.post.title,
          text: data.post.text
        }}
        onSubmit={async values => {
          const { error } = await updatePost(values)
          if (!error) {
            setJustModified(false)
            setShowSuccessMessage(true)
          }
        }}
      >
        {({ isSubmitting }) =>
          <Form
            onChange={() => {
              setJustModified(true)
              setShowSuccessMessage(false)
            }}
          >
            <InputField name='title' placeholder='title' label='Title' />
            <Box mt={4}>
              <InputField name='text' placeholder='text...' label='Body' textarea />
            </Box>
            {
              showSuccessMessage &&
              <FormSuccessMessage message='Post saved successfully.' />
            }
            <Flex mt={4} alignItems='center' justifyContent='space-between'>
              <IconButton
                aria-label='back'
                icon={<ArrowBackIcon />}
                onClick={() => { router.back() }}
              />
              <Button
                type='submit'
                isLoading={isSubmitting}
                disabled={!justModified}
                color='white'
                bgColor='teal'
                ml='34.69px'
              >
                Save
              </Button>
              <Button
                onClick={() => { router.push(`/post/${id}`) }}
              >
                Go to Post
              </Button>
            </Flex>
          </Form>
        }
      </Formik>
    </Layout>
    :
    <></>
}

export default withUrqlClient(createURQLClient)(EditPost)