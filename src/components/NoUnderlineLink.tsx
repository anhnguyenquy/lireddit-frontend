import { Link } from '@chakra-ui/react'

export const NoUnderlineLink = ({ children, ...props }) =>
  <Link
    textDecoration='none'
    _hover={{ textDecoration: 'none' }}
    _active={{ textDecoration: 'none' }}
    _visited={{ textDecoration: 'none' }}
    {...props}
  >
    {children}
  </Link>