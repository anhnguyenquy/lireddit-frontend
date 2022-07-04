import { Box, Flex, Button, Link } from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import NextLink from 'next/link'
import router from 'next/router'
import { useState } from 'react'
import { Wrapper, InputField } from '../components'
import { useForgotPasswordMutation } from '../generated/graphql'
import { createURQLClient, toErrorMap } from '../utils'

interface ForgotPasswordProps {

}

const ForgotPassword: NextPage<ForgotPasswordProps> = () => {
  const [, forgotPassword] = useForgotPasswordMutation()
  const [submittedMail, setSubmittedMail] = useState('')
  const [sentMail, setSentMail] = useState(false)

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await forgotPassword(values)
          if (response.data?.forgotPassword.errors) {
            setErrors(toErrorMap(response.data.forgotPassword.errors))
          }
          else if (response.data?.forgotPassword.success) {
            setSubmittedMail(values.email)
            setSentMail(true)
          }
        }}
      >
        {({ isSubmitting }) =>
          sentMail ?
            <Box color='#22C55E' mt={4} fontSize='0.875rem'>
              If an account associated with {submittedMail} exists in our database, we have sent to the address an email containing a link to reset your password.
            </Box>
            :
            <Form>
              <InputField name='email' placeholder='email' label='Email' />
              <Button
                type='submit'
                isLoading={isSubmitting}
                mt={4}
                bgColor='teal'
                color='white'
              >
                Reset password
              </Button>
            </Form>
        }
      </Formik>
    </Wrapper>
  )
}

export default withUrqlClient(createURQLClient)(ForgotPassword)