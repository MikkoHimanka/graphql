const { ApolloServer, gql, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const config = require('./utils/config')
const Author = require('./models/author')
const Book = require('./models/book')

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((e) => {
    console.log('error connecting to MongoDB:', e.message)
  })

const typeDefs = gql`
  type Book {
      title: String!
      author: Author!
      published: Int!
      genres: [String!]!
      id: ID!
  }
  type Author {
      name: String!
      born: Int
      id: ID!
      bookCount: Int
  }
  type Query {
      bookCount: Int!
      authorCount: Int!
      allBooks(author: String, genre: String): [Book!]!
      allAuthors: [Author!]!
  }
  type Mutation {
      addBook(
          title: String!
          author: String!
          published: Int!
          genres: [String!]!
      ): Book
      editAuthor(
          name: String!
          setBornTo: Int!
      ): Author
  }
`

const resolvers = {
  Query: {
      bookCount: () => Book.collection.countDocuments(),
      authorCount: () => Author.collection.countDocuments(),
      allBooks: (root, args) => {
          if (args.genre && args.author) {
            return Book.find({ author: args.author, genres: { $in: args.genre }}).populate('author')
          } else if (args.author) {
            return Book.find({ author: args.author }).populate('author')
          } else if (args.genre) {
            return Book.find({ genres: { $in: args.genre }}).populate('author')
          } else return Book.find({}).populate('author')
        },
      allAuthors: (root, args) => {
        return Author.find({})
      }
  },
  Author: {
      bookCount: (author) => {
        return Book.find({ author: author }).countDocuments()
      }
  },
  Mutation: {
    addBook: async (root, args) => {
      try {
        const author = await Author.findOne({ name: args.author })
        if (!author) {
          const newAuthor = new Author({name: args.author})
          const id = await newAuthor.save()
          try {
            const book = await new Book({ ...args, author: id._id }).save()
            const newBook = await Book.findOne({id: book._id}).populate('author')
            return newBook
          } catch (e) {
            throw new UserInputError('Book name too short')
          }
        } else {
          try {
            const book = await new Book({ ...args, author: author._id }).save()
            const newBook = await Book.findOne({id: book._id}).populate('author')
            return newBook
          } catch (e) {
            throw new UserInputError('Book name too short')
          }
      }} catch (e) {
        if (e.message.includes('Author')) throw new UserInputError('Author name too short')
      }
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      return await author.save()
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})