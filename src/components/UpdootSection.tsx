import { ArrowDownIcon, ArrowUpIcon } from '@chakra-ui/icons'
import { Flex, IconButton } from '@chakra-ui/react'
import { useState } from 'react'
import { PostSnippetFragment, useDootMutation } from 'src/generated/graphql'
import { useRequireLogin } from 'src/hooks'

interface UpdootSectionProps {
  post: PostSnippetFragment
}

export const UpdootSection = (props: UpdootSectionProps): JSX.Element => {
  const { post: p } = props
  const [loadingState, setLoadingState] = useState<'updoot-loading' | 'downdoot-loading' | 'not-loading'>
    ('not-loading')
  const [, doot] = useDootMutation()
  const requireLogin = useRequireLogin()
  return (
    <Flex flexDir='column' alignItems='center' justifyContent='center' mr={4}>
      <IconButton
        onClick={async () => {
          setLoadingState('updoot-loading')
          requireLogin()
          await doot({
            postId: p.id,
            value: 1,
          })
          setLoadingState('not-loading')
        }}
        isLoading={loadingState == 'updoot-loading'}
        icon={
          <ArrowUpIcon boxSize='22px' />
        }
        color={p.voteStatus == 1 ? 'green' : ''}
        bg='transparent'
        aria-label='updoot'
      />
      {p.points}
      <IconButton
        onClick={async () => {
          setLoadingState('downdoot-loading')
          requireLogin()
          await doot({
            postId: p.id,
            value: -1,
          })
          setLoadingState('not-loading')
        }}
        isLoading={loadingState == 'downdoot-loading'}
        icon={
          <ArrowDownIcon boxSize='22px' />
        }
          color={p.voteStatus == -1 ? 'tomato' : ''}
        bg='transparent'
        aria-label='downdoot'
      />
    </Flex>
  )
}