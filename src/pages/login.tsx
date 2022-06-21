import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import { InputField, Wrapper } from '../components'
import { useLoginMutation } from '../generated/graphql'
import { toErrorMap } from '../utils'

interface Props {

}

const Login = (props: Props): JSX.Element => {
  const { } = props
  const router = useRouter()

  const [, login] = useLoginMutation()

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({ options: values })
          console.log(response)
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors))
          }
          else if (response.data?.login.user) { // if registered successfully
            router.push('/')
          }
        }}
      >
        {({ isSubmitting }) =>
          <Form>
            <InputField name='username' placeholder='username' label='Username' />
            <Box mt={4}>
              <InputField name='password' placeholder='password' label='Password' type='password' />
            </Box>
            <Button
              type='submit'
              isLoading={isSubmitting}
              mt={4}
              bgColor='teal'
              color='white'
            >login
            </Button>
          </Form>
        }
      </Formik>
    </Wrapper>
  )
}

export default Login