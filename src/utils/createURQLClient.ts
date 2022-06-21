import { ClientOptions, dedupExchange, fetchExchange } from 'urql'
import { cacheExchange } from '@urql/exchange-graphcache'
import { LoginMutation, MeQuery, MeDocument, RegisterMutation, LogoutMutation } from '../generated/graphql'
import { NextUrqlClientConfig, NextUrqlPageContext, SSRExchange } from 'next-urql'


export const createURQLClient: NextUrqlClientConfig = (ssrExchange: SSRExchange, ctx: NextUrqlPageContext) => ({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include' // allows the cookie to be sent with the request
  },
  exchanges: [
    dedupExchange,
    cacheExchange({ // cacheExchange used to modify the default caching behaviour of urql
      updates: {
        Mutation: {

          /*
            _result: The full API result that'd by default be written to the cache.
            args: The arguments that the field has been called with, which will be replaced with an empty object if the field hasn't been called with any arguments.
            cache: The cache instance, which gives us access to methods allowing us to interact with the local cache.
            info: Contains running information about the traversal of the query document. It allows us to make resolvers reusable or to retrieve information about the entire query.
          */
          login: (_result: LoginMutation, args, cache, info) => {
            console.log({ _result })

            /* 
              - { query: MeDocument } specifies the query whose cache is to be updated
              - (data: MeQuery) => {...} is the updater function for the previously specified query.
              the updater function takes in the most recent result of a specific query
              and what it returns is the new cache for that query. In this case, what it returns is 
              the new value for data in const [{ data, fetching }] = useMeQuery() 
            */
            cache.updateQuery({ query: MeDocument }, (data: MeQuery) => {
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
          register: (_result: RegisterMutation, args, cache, info) => {
            cache.updateQuery({ query: MeDocument }, (data: MeQuery) => {
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
          logout: (_result: LogoutMutation, args, cache, info) => {
            cache.updateQuery({ query: MeDocument }, (data: MeQuery) => {
              return {
                me: null
              }
            })
          }
        }
      }
    }),
    ssrExchange,
    fetchExchange
  ]
} as ClientOptions)