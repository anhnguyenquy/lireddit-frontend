import { EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { Flex, IconButton } from '@chakra-ui/react'
import { NoUnderlineLink } from './NoUnderlineLink'
import NextLink from 'next/link'
import { useDeletePostMutation } from '../generated/graphql'

interface EditDeletePostButtonsProps {
  id: number
}

export const EditDeletePostButtons = (props: EditDeletePostButtonsProps): JSX.Element => {
  const { id } = props
  const [, deletePost] = useDeletePostMutation()
  return (
    <>
      <NextLink href='/post/edit/[id]' as={`/post/edit/${id}`}>
        <IconButton
          color='brown'
          bg='transparent'
          icon={<EditIcon />}
          aria-label='edit'
          as={NoUnderlineLink}
        />
      </NextLink>
      <IconButton
        color='red.500'
        bg='transparent'
        icon={<DeleteIcon />}
        aria-label='delete'
        onClick={async () => {
          await deletePost({ id })
        }}
      />
    </>
  )
}