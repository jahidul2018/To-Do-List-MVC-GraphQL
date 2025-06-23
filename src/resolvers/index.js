const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Todo = require('../models/Todo');
const Project = require('../models/Project');
const User = require('../models/User');

module.exports = {
    getTodos: async ({ page = 1, limit = 10, search = "" }) => {
        const skip = (page - 1) * limit;
        const regex = new RegExp(search, "i");

        const todos = await Todo.find({ title: { $regex: regex } })
            .populate('projectId')
            .populate('assignedTo')
            .skip(skip)
            .limit(limit);

        return todos;
    },
    getTodo: async ({ id }) => await Todo.findById(id).populate('projectId').populate('assignedTo'),
    getProjects: async () => await Project.find(),
    getProject: async ({ id }) => await Project.findById(id),
    getUsers: async () => await User.find(),

    addUser: async ({ input }) => {
        const user = new User(input);
        return await user.save();
    },

    addProject: async ({ input }) => {
        const project = new Project(input);
        return await project.save();
    },

    addTodo: async ({ input }) => {
        const todo = new Todo({
            title: input.title,
            completed: input.completed || false,
            projectId: input.projectId,
            assignedTo: input.assignedTo
        });
        const task = await todo.save();
        return await task
    },

    // addTodo: async ({ input }) => {
    //     const todo = new Todo({
    //         title: input.title,
    //         completed: input.completed || false,
    //         projectId: input.projectId,
    //         assignedTo: input.assignedTo
    //     });
    //     return await todo.save();
    // },

    updateTodo: async ({ id, input }) => {
        return await Todo.findByIdAndUpdate(id, input, { new: true });
    },

    deleteTodo: async ({ id }) => {
        await Todo.findByIdAndDelete(id);
        return "Todo deleted";
    },

    // Authentication logic can be added here if needed
    // registerUser: async ({ input }) => {
    //     const hashed = await bcrypt.hash(input.password, 10);
    //     const user = new User({ ...input, password: hashed });
    //     return await user.save();
    // },

    registerUser: async ({ input }) => {
        const hashed = await bcrypt.hash(input.password, 10);
        const user = new User({
            name: input.name,
            email: input.email,
            password: hashed,
            role: input.role || 'employee',
        });
        return await user.save();
    },

    login: async ({ input }) => {
        const user = await User.findOne({ email: input.email });
        if (!user) throw new Error("User not found");

        const isMatch = await bcrypt.compare(input.password, user.password);
        if (!isMatch) throw new Error("Invalid password");

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return { token, user };
    }
};

// Example Usage in GraphiQL

// Create a User:

// mutation {
//     addUser(input: { name: "Fahim", email: "fahim@example.com" }) {
//       id
//       name
//     }
//   }

// Create a Project:

// mutation {
//     addProject(input: { name: "Project Alpha", description: "Main project" }) {
//       id
//       name
//     }
//   }

// Create a Todo:

// mutation {
//     addTodo(input: {
//       title: "Build GraphQL endpoint"
//       completed: false
//       projectId: "PROJECT_ID_HERE"
//       assignedTo: "USER_ID_HERE"
//     }) {
//       id
//       title
//     }
//   }

// Get All To-dos:

// query {
//     getTodos {
//       id
//       title
//       completed
//       project {
//         name
//       }
//       assignedUser {
//         name
//       }
//     }
//   }

// get To-dos with Pagination:
// query {
//     getTodos(page: 1, limit: 2, search: "Test") {
//       id
//       title
//     }
//   }

// auth
// mutation {
//     login(input: { email: "testuser@example.com", password: "123456" }) {
//       token
//       user {
//         id
//         name
//       }
//     }
//   }





