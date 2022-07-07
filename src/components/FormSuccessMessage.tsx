import { CheckIcon } from '@chakra-ui/icons'
import { Flex, Box } from '@chakra-ui/react'
import { formSuccessMessage } from 'src/styles'

interface FormSuccessMessageProps {
  message: string
}

export const FormSuccessMessage = (props: FormSuccessMessageProps): JSX.Element => {
  const { message } = props 
  return (
    <Flex alignItems='center' style={formSuccessMessage}>
      <CheckIcon color='green.700' fontSize='0.875rem' mr={2} />
      <Box>{message}</Box>
    </Flex>
  )
}