import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { IconButton } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useDeletePostMutation } from 'src/generated/graphql'
import { NoUnderlineLink } from './NoUnderlineLink'

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