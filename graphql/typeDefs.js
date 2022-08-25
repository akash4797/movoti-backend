import { gql } from "apollo-server-express";

export default gql`
  #SECTION for global use
  type User {
    id: String
    username: String!
    name: String!
    contact: String!
    email: String
    role: String!
    updatedAt: String!
    token: String
  }

  #SECTION for query
  input LoginInput {
    username: String!
    password: String!
  }

  input FindOneMovieInput {
    id: String!
  }

  type Movie {
    id: String!
    title: String!
    genre: String!
    description: String!
    cast: String!
    rating: String!
    type: String!
    price: Float!
    image: String!
  }

  #SECTION for Mutation
  input RegisterInput {
    username: String!
    email: String!
    name: String!
    contact: String!
    password: String!
    confirmPassword: String!
  }

  input EditUserInput {
    name: String
    email: String
    contact: String
  }

  #SECTION main
  type Query {
    login(userinput: LoginInput): User!
    getmovies: [Movie]!
    getonemovie(userinput: FindOneMovieInput): Movie!
  }
  type Mutation {
    register(userinput: RegisterInput): User!
    editUser(userinput: EditUserInput): User!
  }
`;
