import { Box, Button, Flex, Link } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import { InputField, Wrapper } from '../components'
import { useLoginMutation } from '../generated/graphql'
import { createURQLClient, toErrorMap } from '../utils'
import NextLink from 'next/link'

interface LoginProps {

}

const Login = (props: LoginProps): JSX.Element => {
  const { } = props
  const router = useRouter()
  const [, login] = useLoginMutation()

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ emailOrUsername: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({ options: values })
          /*
            response = {
              data: {
                login: {
                  errors: null,
                  user: {
                    id: 1,
                    username: 'admin',
                    __typename: 'User'
                  },
                  __typename: 'UserResponse'
                }
              },
              error: undefined
              extensions: undefined
              operation: {...}
            } 
          */

          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors))
          }
          else if (response.data?.login.user) { // if registered successfully
            if (typeof router.query.next === 'string') {
              router.push(router.query.next)
            }
            else { // next is undefined
              router.push('/')
            }
          }
        }}
      >
        {({ isSubmitting }) =>
          <Form>
            <InputField name='emailOrUsername' placeholder='email or username' label='Email or Username' />
            <Box mt={4}>
              <InputField name='password' placeholder='password' label='Password' type='password' />
            </Box>
            <Flex mt={2} justifyContent='space-between' fontSize='0.875rem'>
              <NextLink href='/forgot-password'>
                <Link>Forgot password?</Link>
              </NextLink>
              <NextLink href='/register'>
                <Link>Don't have an account yet? Register.</Link>
              </NextLink>
            </Flex>
            <Button
              type='submit'
              isLoading={isSubmitting}
              mt={4}
              bgColor='teal'
              color='white'
            >
              Login
            </Button>
          </Form>
        }
      </Formik>
    </Wrapper>
  )
}

export default withUrqlClient(createURQLClient)(Login)