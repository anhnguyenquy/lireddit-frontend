import { Box, Button } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { useState } from 'react'
import { InputField, Wrapper } from 'src/components'
import { useForgotPasswordMutation } from 'src/generated/graphql'
import { createURQLClient, toErrorMap } from 'src/utils'

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