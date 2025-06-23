# 📝 To-Do List App (Node.js + Express + GraphQL + MongoDB)

A full-stack backend application for managing projects, tasks, and users — built using **Node.js**, **Express**, **GraphQL**, **Mongoose**, and **JWT Authentication**.

## 🔧 Features

- ✅ User Registration & Login with Role-based Access (Admin & Employee)
- ✅ JWT Authentication Middleware
- ✅ Create and Manage Projects
- ✅ Create Tasks (To-dos) under Projects
- ✅ Assign Tasks to Users
- ✅ Paginated and Searchable Task Queries
- ✅ Modular MVC Folder Structure
- ✅ Full Test Suite with Jest & Supertest

---

## 📁 Project Structure


todo-graphql-app/
│
├── src/
│ ├── models/ # Mongoose models (User, Todo, Project)
│ ├── resolvers/ # GraphQL resolver functions
│ ├── schemas/ # GraphQL schema definitions
│ ├── middleware/ # Auth middleware (JWT validation)
│ └── config/ # DB config (optional)
│
├── tests/ # Jest + Supertest test cases
├── .env
├── .gitignore
├── package.json
├── server.js # App entry point
└── README.md


---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/todo-graphql-app.git
cd todo-graphql-app

2. Install dependencies

npm install

3. Setup environment variables
Create a .env file:

PORT=5000
MONGO_URI=mongodb://localhost:27017/todo-graphql
JWT_SECRET=your_jwt_secret

4. Start the server
npm run dev

Access GraphQL at:
http://localhost:5000/graphql

🧪 Running Tests

npm test

Includes:

User registration/login

Project creation

Task creation

Pagination & filtering

📌 Sample GraphQL Queries
Register User

mutation {
  registerUser(input: {
    name: "John",
    email: "john@example.com",
    password: "123456",
    role: "admin"
  }) {
    id
    name
  }
}

Login

mutation {
  login(input: {
    email: "john@example.com",
    password: "123456"
  }) {
    token
    user {
      id
      name
    }
  }
}

Create Project

mutation {
  addProject(input: {
    name: "Apollo Project",
    description: "GraphQL-based project"
  }) {
    id
    name
  }
}

Create Task
mutation {
  addTodo(input: {
    title: "Build GraphQL schema",
    completed: false,
    projectId: "PROJECT_ID",
    assignedTo: "USER_ID"
  }) {
    id
    title
  }
}

📌 Technologies Used
Node.js

Express.js

GraphQL

Mongoose / MongoDB

JWT (JSON Web Tokens)

Jest for testing

Supertest for endpoint testing


🧑‍💻 Author
Built by [MD. Jahidul Alam]
Feel free to contribute or fork the project.


Would you like me to include this file in the project structure or generate the ZIP with everything configured and ready to run?
