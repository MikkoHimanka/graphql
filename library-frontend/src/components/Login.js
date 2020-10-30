import { useMutation } from '@apollo/client'
import React, { useState, useEffect } from 'react'
import { LOGIN } from '../queries'

const Login = ({ show, setError, setToken, redirect }) => {
  const [username, setName] = useState('')
  const [password, setPassword] = useState('')
  
  const [ login, result ] = useMutation(LOGIN, {
      onError: (e) => {
          setError(e.graphQLErrors[0].message)
      }
  })

  useEffect(() => {
      if (result.data) {
          const token = result.data.login.value
          setToken(token)
          localStorage.setItem('token', token)
          redirect()
      }
  }, [result.data]) //eslint-disable-line

  const submit = async (event) => {
      event.preventDefault()
      login({ variables: {username, password}})
  }

  if (!show) {
    return null
  }

  return (
    <div>
      <h2>login</h2>

      <form onSubmit={submit}>
        <div>
          username
          <input
            value={username}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          password
          <input
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}

export default Login