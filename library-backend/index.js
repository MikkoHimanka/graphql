const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const mongoose = require('mongoose')
const config = require('./utils/config')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const jwt = require('jsonwebtoken')

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((e) => {
    console.log('error connecting to MongoDB:', e.message)
  })

const typeDefs = gql`
  type User {
    username: String!
    favouriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
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
      me: User
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
      createUser(
        username: String!
        favouriteGenre: String!
      ): User
      login(
        username: String!
        password: String!
      ): Token
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
      },
      me: (root, args, context) => {
        return context.currentUser
      }
  },
  Author: {
      bookCount: (author) => {
        return Book.find({ author: author }).countDocuments()
      }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new AuthenticationError('Invalid credentials')
      }
      try {
        const author = await Author.findOne({ name: args.author })
        if (!author) {
          const newAuthor = new Author({name: args.author})
          const id = await newAuthor.save()
          const book = await new Book({ ...args, author: id._id }).save()
          const newBook = await Book.findOne({id: book._id}).populate('author')
          return newBook
        } else {
          const book = await new Book({ ...args, author: author._id }).save()
          const newBook = await Book.findOne({id: book._id}).populate('author')
          return newBook
      }} catch (e) {
        if (e.message.startsWith('Book')) throw new UserInputError('Book name too short')
        if (e.message.startsWith('Author')) throw new UserInputError('Author name too short')
      }
    },
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new AuthenticationError('Invalid credentials')
      }
      const author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      return await author.save()
    },
    createUser: (root, args) => {
      const user = new User({ username:args.username, favouriteGenre: args.favouriteGenre })

      return user.save()
        .catch(e => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new UserInputError('Wrong credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, config.JWT_SECRET) }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), config.JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  },
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})