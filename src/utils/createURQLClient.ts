import { cacheExchange, Resolver } from '@urql/exchange-graphcache'
import { NextUrqlClientConfig } from 'next-urql'
import Router from 'next/router'
import { dedupExchange, Exchange, fetchExchange, gql } from 'urql'
import { pipe, tap } from 'wonka'
import { CreatePostMutation, DootMutation, DootMutationVariables, LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql'
import { isServer } from './isServer'

// returns the links for all previously cached items given query
export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    /*
      fieldArgs: {
        "limit": 10,
      }
    */

    const { parentKey: entityKey, fieldName } = info // entityKey: 'Query'/'Mutation'; fieldName: 'posts'  
    const allFields = cache.inspectFields(entityKey) // infos about all queries/mutations in the cache
    /*
      allFields: [
        {
          "fieldKey": "me",
          "fieldName": "me",
          "arguments": null
        },
        {
          "fieldKey": "posts({\"limit\":10})",
          "fieldName": "posts",
          "arguments": {
            "limit": 10
          }
        }
      ]
    */

    const fieldInfos = allFields.filter(info => info.fieldName === fieldName)
    const size = fieldInfos.length
    if (size === 0) {
      return undefined
    }

    const inCache = cache.resolve( // returns null if not in cache
      cache.resolve(entityKey, fieldName, fieldArgs) as string,
      'posts'
    )

    /* 
      - If {info.partial} is set to false, then the data is already in the cache 
      and thus there is no need to go fetch it from the server. 
      {results} then will return the combined data from the cache containing data
      of the new query itself.
      - If, on the other hand, {info.partial} is set to true,
      then the data is not in the cache; it will be fetched from the server and
      automatically combined into the cache in the background.
    */
    info.partial = !inCache // !null == true
    let hasMore = true
    const results: string[] = []
    fieldInfos.forEach(fi => {
      const key = cache.resolve(entityKey, fi.fieldName, fi.arguments) as string
      // key: "Query.posts({\"limit\":10})"

      const _hasMore = cache.resolve(key, 'hasMore') // true/false
      const posts = cache.resolve(key, 'posts') as string[]
      /*
        posts: [
          "Post:3",
          "Post:4",
          "Post:5",
          "Post:6",
          "Post:7",
          "Post:8",
          "Post:9",
          "Post:10",
          "Post:11",
          "Post:2"
        ]
      */

      if (!_hasMore) {
        hasMore = false
      }
      results.push(...posts)
    })
    return {
      __typename: 'PaginatedPosts',
      hasMore,
      posts: results
    }
  }
}

const errorExchange: Exchange = ({ forward }) => ops$ => { // runs every time the server throws an error
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes('Not authenticated')) {
        Router.replace('/login') // replaces the current route in history to the new address rather than pushing to a new entry
      }
    })
  )
}

export const createURQLClient: NextUrqlClientConfig = (ssrExchange, ctx) => {
  let cookie = ''
  if (isServer() && ctx?.req?.headers?.cookie) { // if ssr is enabled and this is the first query
    cookie = ctx.req.headers.cookie
  }
  return {
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: 'include', // allows the cookie to be sent with the request
      headers: cookie ? { cookie } : undefined
    },
    exchanges: [
      dedupExchange,
      cacheExchange({ // cacheExchange used to modify the default caching behaviour of urql
        keys: {
          PaginatedPosts: () => null
        },
        resolvers: { // changes what is cached after queries are run 
          Query: {
            posts: cursorPagination()
          }
        },
        updates: {   // changes what is cached after mutations are run
          Mutation: {
            doot: (result: DootMutation, args: DootMutationVariables, cache, info) => {
              const { postId, value } = args

              // reads data of the updated (just dooted) post from the cache
              const data = cache.readFragment(
                gql`
                fragment _ on Post {
                  points
                  voteStatus
                }
              `,
                { id: postId }
              )
              const { points, voteStatus } = data
              if (data) {                   // if the post is in the cache to be updated
                if (value != voteStatus) {  // if the user is changing their past vote status
                  let valueToAdd
                  if (voteStatus == null) { // if the user has never voted before
                    valueToAdd = value
                  }
                  else {                    // if the user has voted before
                    valueToAdd = value == -1 ? -2 : 2
                  }
                  const newPoints = points + valueToAdd
                  // updates data of the updated (just dooted) from post from the cache
                  cache.writeFragment(
                    gql`
                  fragment _ on Post {
                    points  
                    voteStatus
                  }
                `,

                    /*
                      This should not only contain properties that are necessary to derive an entity key 
                      from the given data, but also the fields that will be written.
                    */
                    { id: postId, points: newPoints, voteStatus: value }
                  )
                }
                else { // if the user is undoing their vote

                  cache.writeFragment(
                    gql`
                  fragment _ on Post {
                    points  
                    voteStatus
                  }
                `,

                    { id: postId, points: points + (value == 1 ? -1 : 1), voteStatus: null }
                  )
                }
              }
            },
            createPost: (_result: CreatePostMutation, _args, cache, _info) => {
              // removes the cache of the posts query with the specified arguments
              // from the cache so that urql automatically refetches
              const allFields = cache.inspectFields('Query')
              const fieldInfos = allFields.filter(info => info.fieldName === 'posts')

              // cache.invalidate('Query', 'posts') doesn't work so we have to
              // manually remove all cache of posts
              for (let info of fieldInfos) {
                cache.invalidate('Query', 'posts', info.arguments)
              }
            },
            /*
              _result: The return value of the login mutation resolver e.g. 
              {
                login: {
                  errors: null,
                  user: {
                    id: 1,
                    username: 'admin',
                    __typename: 'User'
                  },
                  __typename: 'UserResponse'
                }
              }
              
              args: The arguments that the query/mutation has been called with e.g. 
              {
                options: {
                  username: 'admin',
                  password: '123456'
                }
              }
  
              cache: The cache instance, which gives us access to methods allowing us to interact with the local cache.
              info: Contains running information about the traversal of the query document. It allows us to make resolvers reusable or to retrieve information about the entire query.
            */
            login: (_result: LoginMutation, _args, cache, _info) => {
              const allFields = cache.inspectFields('Query')
              const fieldInfos = allFields.filter(info => info.fieldName === 'posts')
              for (let info of fieldInfos) {
                cache.invalidate('Query', 'posts', info.arguments)
              }

              /* 
                - { query: MeDocument } specifies the query whose cache is to be updated
                - (data: MeQuery) => {...} is the updater function for the previously specified query.
                the updater function takes in the most recent result of a specific query
                and what it returns is the new cache for that query. In this case, what it returns is 
                the new value for data in const [{ data, fetching }] = useMeQuery() 
              */
              cache.updateQuery({ query: MeDocument }, (data: MeQuery) => {
                // if the user has not been logged in previously, data should be null

                if (_result.login.errors) { // If logging in is unsuccessful, keep the cache for the me query the same..
                  return data
                }
                else {                      // If logging in is successful, update the cache for the me query.
                  return {
                    me: _result.login.user
                  }
                }
              })
            },
            register: (_result: RegisterMutation, _args, cache, _info) => {
              cache.updateQuery({ query: MeDocument }, (data: MeQuery) => {
                /* 
                  here data looks something like this:
                  {
                    me: {
                      id: 1,
                      username: 'admin',
                      __typename: 'User'
                    }
                  }
                */

                if (_result.register.errors) {
                  return data
                }
                else {
                  return {
                    me: _result.register.user
                  }
                }
              })
            },
            logout: (_result: LogoutMutation, _args, cache, _info) => {
              const allFields = cache.inspectFields('Query')
              const fieldInfos = allFields.filter(info => info.fieldName === 'posts')
              for (let info of fieldInfos) {
                cache.invalidate('Query', 'posts', info.arguments)
              }
              cache.updateQuery({ query: MeDocument }, (_: MeQuery) => {
                return {
                  me: null
                }
              })
            }
          }
        }
      }),
      errorExchange,
      ssrExchange,
      fetchExchange
    ]
  }
}