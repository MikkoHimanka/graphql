import React from 'react'

const Books = (props) => {
  if (!props.show) {
    return null
  }

  if (props.books.loading) {
    return <div>loading...</div>
  }

  const unique = (value, index, self) => {
    return self.indexOf(value) === index
  }

  const books = props.books.data.allBooks
  const genres = books.map(x => x.genres).flat(1).filter(unique)

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      {genres.map(g => 
        <button>{g}</button>
      )}
    </div>
  )
}

export default Books