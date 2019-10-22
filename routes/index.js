require('dotenv').config()
const fs = require('fs')
const express = require('express');
const jwt = require('jsonwebtoken')
const gql = require('graphql-tag')
const base64url = require('base64url')

const client = require('../graphql')

const router = express.Router();

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', async (req, res, next) => {
  const query = gql`query findUser($email: String) {
    users(where: {email: {_eq: $email}}) {
      id
      name
    }
  }`

  try {
    const { data } = await client.query({ query, variables: { email: req.body.email } })
    const user = data.users[0]
    const secret = fs.readFileSync('private/private.pem', 'utf8')
    const token = jwt.sign({
      "https://hasura.io/jwt/claims": {
        "x-hasura-allowed-roles": ["admin", "admission", "instructor", "student"],
        "x-hasura-default-role": "student",
        "x-hasura-user-id": user.id,
      }
    }, secret, { algorithm: 'RS256' })
    res.json({
      ok: true,
      token
    })
  } catch (error) {
    next(error)
    // res.json({
    //   ok: false,
    //   error: error.message
    // })
  }
})

router.get('/jwk', (req, res, next) => {
  const public = fs.readFileSync('private/public.pem', 'utf8')
  const key = public
    .slice(
      public.indexOf('-----BEGIN PUBLIC KEY-----'),
      public.indexOf('-----END PUBLIC KEY-----') + 24
    )

  res.json({
    keys: [{
      "kid": "foxhub",
      "e": "AQAB",
      "kty": "RSA",
      "alg": "RS256",
      "n": base64url(key),
      "use": "sig"
    }]
  })
})

module.exports = router;
