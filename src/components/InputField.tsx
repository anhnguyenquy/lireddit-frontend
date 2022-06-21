import { FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react'
import { useField } from 'formik'
import { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  name: string
  size?: null
}

// '' -> false
// 'error message stuffs' -> true

export const InputField = (props: Props): JSX.Element => {
  const { label, name, ...rest } = props
  const [field, { error }] = useField(props) // return the argument as field and an object containing any error message about the form
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Input {...field} {...props} id={field.name} />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  )
}