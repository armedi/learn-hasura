const { ApolloClient } = require('apollo-client');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { HttpLink } = require('apollo-link-http');
const { ApolloLink, concat } = require('apollo-link');
const fetch = require('node-fetch')

const link = new HttpLink({
  uri: 'http://localhost:8080/v1/graphql',
  fetch
});

const authMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      "X-Hasura-Admin-Secret": process.env.HASURA_ADMIN_SECRET,
    }
  });
  return forward(operation);
})

const cache = new InMemoryCache()

const client = new ApolloClient({
  cache,
  link: concat(authMiddleware, link),
  defaultOptions: { query: { fetchPolicy: 'network-only' } }
});

module.exports = client