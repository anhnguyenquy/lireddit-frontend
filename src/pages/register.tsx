import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import { InputField, Wrapper } from '../components'
import { useRegisterMutation } from '../generated/graphql'
import { toErrorMap } from '../utils'

interface Props {

}

const Register = (props: Props): JSX.Element => {
  const { } = props
  const router = useRouter()

  /* const REGISTER_MUT = `
  mutation Register($username: String!, $password: String!) {
    register(options: { username: $username, password: $password }) {
      errors {
        field
        message
      }
      user {
        ...RegularUser
      }
    }
  }`
  */

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
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register(values)
          console.log(response)
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
            >register
            </Button>
          </Form>
        }
      </Formik>
    </Wrapper>
  )
}

export default Register