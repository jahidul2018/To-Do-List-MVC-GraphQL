const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { graphqlHTTP } = require('express-graphql');
const schema = require('../src/schemas');
const resolvers = require('../src/resolvers');
const authMiddleware = require('../src/middleware/auth');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(authMiddleware);
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: resolvers,
  graphiql: false,
}));

let token = '';
let userId, projectId, todoId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe('User, Project, Task, and Auth Tests', () => {

  it('should register a user', async () => {
    const query = {
      query: `
        mutation {
          registerUser(input: {
            name: "Test User",
            email: "testuser@example.com",
            password: "123456",
            role: "admin"
          }) {
            id
            name
          }
        }
      `
    };
    const res = await request(app).post('/graphql').send(query);
    expect(res.status).toBe(200);
    expect(res.body.data.registerUser.name).toBe("Test User");
    userId = res.body.data.registerUser.id;
  });

  it('should login the user and return token', async () => {
    const query = {
      query: `
        mutation {
          login(input: {
            email: "testuser@example.com",
            password: "123456"
          }) {
            token
            user {
              id
              name
            }
          }
        }
      `
    };
    const res = await request(app).post('/graphql').send(query);
    console.log("Login Response:", JSON.stringify(res.body, null, 2)); // Add this line
    expect(res.status).toBe(200);
    expect(res.body.data.login.token).toBeDefined();
    token = res.body.data.login.token;
  });


  it('should create a project', async () => {
    const query = {
      query: `
        mutation {
          addProject(input: {
            name: "Project Apollo",
            description: "Test project"
          }) {
            id
            name
          }
        }
      `
    };
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send(query);
    expect(res.status).toBe(200);
    expect(res.body.data.addProject.name).toBe("Project Apollo");
    projectId = res.body.data.addProject.id;
  });

  it('should create a task (todo)', async () => {
    const query = {
      query: `
        mutation {
          addTodo(input: {
            title: "Initial Setup Task"
            completed: false
            projectId: "${projectId}"
            assignedTo: "${userId}"
          }) {
            id
            title
            project {
              name
            }
            assignedUser {
              name
            }
          }
        }
      `
    };
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send(query);
    expect(res.status).toBe(200);
    expect(res.body.data.addTodo.projectId.name).toBe("Project Apollo");
    expect(res.body.data.addTodo.assignedTo.name).toBe("Test User");
    todoId = res.body.data.addTodo.id;
  });

  it('should fetch tasks with pagination and filtering', async () => {
    const query = {
      query: `
        {
          getTodos(page: 1, limit: 5, search: "Setup") {
            id
            title
            project {
              name
            }
            assignedUser {
              email
            }
          }
        }
      `
    };
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send(query);
    expect(res.status).toBe(200);
    expect(res.body.data.getTodos[0].projectId.name).toBe("Project Apollo");
    expect(res.body.data.getTodos[0].assignedTo.email).toBe("testuser@example.com");
  });

});
