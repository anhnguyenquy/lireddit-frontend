import { useMeQuery } from '../generated/graphql'

export const useUser = () => {
  const [{ data }] = useMeQuery()
  return data?.me
}