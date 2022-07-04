import { Box, Button, Flex, Link } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import { InputField, Wrapper } from '../components'
import { useRegisterMutation } from '../generated/graphql'
import { createURQLClient, toErrorMap } from '../utils'
import NextLink from 'next/link'

interface RegisterProps {

}

const Register = (props: RegisterProps): JSX.Element => {
  const { } = props
  const router = useRouter()

  // REGISTER_MUT is register.graphql

  /* 
    useRegisterMutation provides types for the response of register, whilst useMutation(REGISTER_MUT) does not
    To generate useRegisterMutation: 
    1. yarn add -D @graphql-codegen/cli
    2. yarn graphql-codegen init:
      . Application built with React
      . http://localhost:4000/graphql
      . src/graphql/** /* /graphql
      . [The first 3]
      . src/generated/graphql.tsx
      . codegen.yml
      . gen
    3. codegen.yml: replace "typescript-react-apollo" with "typescript-urql"
    4. package.json: remove "@graphql-codegen/typescript-react-apollo" under devDependencies
    5. yarn add -D @graphql-codegen/typescript-urql
    6. touch src/graphqlmutations/register.graphql
    7. copy REGISTER_MUT to register.graphql
    8. yarn gen
  */
  const [, register] = useRegisterMutation() // ignore the first returned item in the array

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email: '', username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({ options: values })
          if (response.data?.register.errors) { // returns undefined if data is undefined and hence does not execute the block
            // setErrors accept an object with keys being the fields with error and the values being the messages for the corresponding fields
            setErrors(toErrorMap(response.data.register.errors))
          }
          else if (response.data?.register.user) { // if registered successfully
            router.push('/')
          }
        }}
      >
        {({ isSubmitting }) =>
          <Form>
            <InputField name='email' placeholder='email' label='Email' />
            <Box mt={4} mb={4}>
              <InputField name='username' placeholder='username' label='Username' />
            </Box>
            <InputField name='password' placeholder='password' label='Password' type='password' />
            <Flex mt={2} fontSize='0.875rem'>
              <NextLink href='/login'>
                <Link>Already have an account? Login.</Link>
              </NextLink>
            </Flex>
            <Button
              type='submit'
              isLoading={isSubmitting}
              mt={4}
              bgColor='teal'
              color='white'
            >
              Register
            </Button>
          </Form>
        }
      </Formik>
    </Wrapper>
  )
}

export default withUrqlClient(createURQLClient)(Register)