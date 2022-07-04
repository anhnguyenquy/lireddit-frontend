import { FormControl, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/react'
import { useField } from 'formik'
import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type InputFieldProps = any & {
  label: string
  name: string
  textarea?: boolean
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  name: string
  size?: null
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  name: string
  size?: null
}

const InputComponent = (props: InputProps): JSX.Element => {
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

const TextAreaComponent = (props: TextareaProps): JSX.Element => {
  const { label, name, ...rest } = props
  const [field, { error }] = useField(props)
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Textarea {...field} {...props} id={field.name} />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  )
}

export const InputField = (props: InputFieldProps): JSX.Element => {
  const { label, name, textarea = false, ...rest } = props
  return textarea ? <TextAreaComponent label={label} name={name} {...rest} /> :
    <InputComponent label={label} name={name} {...rest} />
}