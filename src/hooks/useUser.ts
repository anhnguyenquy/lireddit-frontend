import { useMeQuery } from 'src/generated/graphql'

export const useUser = () => {
  const [{ data }] = useMeQuery()
  return data?.me
}