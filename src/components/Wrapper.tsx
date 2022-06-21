import { Box } from '@chakra-ui/react'

interface Props {
  children: React.ReactNode
  variant?: 'small' | 'regular'
}

export const Wrapper = (props: Props): JSX.Element => {
  const { children, variant = 'regular' } = props
  return (
    <Box mt={8} maxW={variant == 'regular' ? '800px' : '400px'} w='100%' mx='auto'>
      {children}
    </Box>
  )
}