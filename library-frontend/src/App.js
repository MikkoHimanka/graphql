import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'

import { useApolloClient, useQuery } from '@apollo/client'
import { ALL_AUTHORS, ALL_BOOKS } from './queries'

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [error, setError] = useState(null)
  const [page, setPage] = useState('authors')
  
  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  
  const client = useApolloClient()

  useEffect(() => {
    const timer = setTimeout(() => {
      setError(null)
    }, 5000);
    return () => clearTimeout(timer)
  }, [error]) //eslint-disable-line

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  const errorMessage = () => {
    if (error) return (
      <div style={{marginBottom: 1 + 'em'}}>
        {error}
      </div>
    )
  }

  if (!token) {
    return (
      <div>
        {errorMessage()}
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('login')}>login</button>
      </div>

      <Authors
        show={page === 'authors'} authors={authors} token={token} setError={setError}
      />

      <Books
        show={page === 'books'} books={books}
      />

      <Login
        show={page === 'login'} setToken={setToken} setError={setError} redirect={() => setPage('authors')}
      />
    </div>  
    )
  }

  return (
    <div>
      {errorMessage()}
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={logout}>logout</button>
      </div>

      <Authors
        show={page === 'authors'} authors={authors}
      />

      <Books
        show={page === 'books'} books={books}
      />

      <NewBook
        show={page === 'add'} setError={setError}
      />

    </div>
  )
}

export default App