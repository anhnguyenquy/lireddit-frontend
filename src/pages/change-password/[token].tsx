import { Box, Button, Flex, Link } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { InputField, Wrapper } from '../../components'
import { useChangePasswordMutation } from '../../generated/graphql'
import { formErrorMessage } from '../../styles'
import { createURQLClient, sleep, toErrorMap } from '../../utils'

interface ChangePasswordProps {
  token: string
}

const ChangePassword: NextPage<ChangePasswordProps> = () => {
  const router = useRouter()
  const [, changePassword] = useChangePasswordMutation()
  const [tokenError, setTokenError] = useState('')
  const [resetted, setResetted] = useState(false)
  const [redirectAfter, setRedirectAfter] = useState(3)
  useEffect(() => {
    if (resetted) {
      setInterval(() => { setRedirectAfter(prev => prev - 1) }, 1000)
    }
  }, [resetted])
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            token: router.query.token as string,
            newPassword: values.newPassword
          })
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors)
            if ('token' in errorMap) {
              setTokenError(errorMap.token)
            }
            setErrors(errorMap)
          }
          else if (response.data?.changePassword.user) {
            setResetted(true)
            await sleep(3000)

            /*
              We don't need to update the cache for the me query after changing the password because
              this page is opened only in a new tab because it is from the link in the email and as such,
              the me query has never been run and there is no existing cache. When the user is redirected
              to the home page, the me query will be run and the cache will be updated automatically.
            */
            router.push('/')
          }
        }}
      >
        {({ isSubmitting }) =>
          resetted ?
            <Box color='#22C55E' mt={4} fontSize='0.875rem'>
              Password reset successful. Redirecting to homepage in {redirectAfter}
            </Box>
            :
            <Form>
              <InputField name='newPassword' placeholder='new password' label='New Password' type='password' />
              {
                tokenError &&
                <Flex>
                  <Box style={formErrorMessage} mr={1}>{tokenError}</Box>
                  {
                    tokenError == 'Token expired.' &&
                    <NextLink href='/forgot-password'>
                      <Link style={formErrorMessage}>Get new token?</Link>
                    </NextLink>
                  }
                </Flex>
              }
              <Button
                type='submit'
                isLoading={isSubmitting}
                mt={4}
                bgColor='teal'
                color='white'
              >
                Change Password
              </Button>
            </Form>
        }
      </Formik>
    </Wrapper>
  )
}

// We are only preprocessing the context here, so we use getInitialProps.
// If any data fetching is involved, use getServerSideProps or getStaticProps.
// It is better to use router.query.token than to use getInitialProps because Next does not
// optimise the latter.
// ChangePassword.getInitialProps = (ctx) => {
//   return {
//     token: ctx.query.token as string
//   }
// }

export default withUrqlClient(createURQLClient)(ChangePassword)