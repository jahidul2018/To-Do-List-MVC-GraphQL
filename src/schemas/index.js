const { buildSchema } = require('graphql');

module.exports = buildSchema(`

  type User {
    id: ID!
    name: String!
    email: String!
    role: String
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
    role: String
  }

  type Project {
    id: ID!
    name: String!
    description: String
  }

  input ProjectInput {
    name: String!
    description: String
  }

  type Todo {
    id: ID!
    title: String!
    completed: Boolean!
    projectId: Project
    assignedTo: User
  }

  input TodoInput {
    title: String!
    completed: Boolean
    projectId: ID!
    assignedTo: ID!
  }

  type Query {
    getTodos(page: Int, limit: Int, search: String): [Todo]
    getTodo(id: ID!): Todo
    getProjects: [Project]
    getProject(id: ID!): Project
    getUsers: [User]
  }

  type Mutation {
    addUser(input: UserInput): User
    addProject(input: ProjectInput): Project
    addTodo(input: TodoInput): Todo
    updateTodo(id: ID!, input: TodoInput): Todo
    deleteTodo(id: ID!): String
    registerUser(input: UserInput): User
    login(input: LoginInput): AuthPayload
  }

  type AuthPayload {
    token: String
    user: User
  }

  input LoginInput {
    email: String!
    password: String!
  }

`);
