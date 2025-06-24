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
    description: String
    dueDate: String
    priority: String
    tags: [String]
    attachments: [String]
    notes: [String]
    subtasks: [Todo]
    completed: Boolean!
    projectId: Project
    assignedTo: User
  }
  
  type PaginatedTodos {
    todos: [Todo!]!
    total: Int!
    page: Int!
    pages: Int!
  }

  input TodoInput {
    title: String!
    description: String
    dueDate: String
    priority: String
    tags: [String]
    attachments: [String]
    notes: [String]
    subtasks: [TodoInput]
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
    getUser(id: ID!): User
    getTotalTodos: Int
    getTotalProjects: Int
    getTotalUsers: Int
    getCompletedTodos: Int
    getPendingTodos: Int
    getUserTodos(userId: ID!, page: Int, limit: Int, pagination: Boolean, search: String): PaginatedTodos
    getUserTodosWithoutPagination(userId: ID!): [Todo]
    getUserProjects(userId: ID!): [Project]

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
