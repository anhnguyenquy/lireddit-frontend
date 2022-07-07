import { usePostQuery } from 'src/generated/graphql'
import { useGetQueryID } from './useGetQueryID'

export const useGetPostFromURL = () => {
  const intId = useGetQueryID()
  return usePostQuery({
    pause: intId == -1,
    variables: {
      id: intId
    }
  })
}