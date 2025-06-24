const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Todo = require('../models/Todo');
const Project = require('../models/Project');
const User = require('../models/User');
const mongoose = require('mongoose');
// import { ObjectId } from 'mongodb';

const { buildGlobalSearchMatch, getSearchableFields } = require('../utils/search');

// const searchableFields = [
//     "title",
//     "description",
//     "status",
//     "projectId.name",
//     "projectId.code",
//     "projectId.description",
//     "assignedTo.name",
//     "assignedTo.email",
//     "assignedTo.role"
// ];


// Define excluded fields (common ones that usually aren't searched)
const EXCLUDED_TODO_FIELDS = [
    // '_id',        // Mapped to 'id', usually not searched directly
    '__v',        // Mongoose version key
    'subtasks',   // Subtasks are often complex objects, better to search their individual fields if needed
    'attachments',// File paths/URLs usually not text searchable
    'notes',      // Can be long text, but if you want to search it, remove from here.
    'dueDate',    // Date field, usually searched with date range queries, not text search
    'priority',   // Enum, often filtered directly
    'tags',       // Array, often filtered directly
    'completed'   // Boolean, filtered directly
];

// Define nested fields from lookups that you want to be searchable
const NESTED_SEARCHABLE_FIELDS = [
    "projectId.name",
    "projectId.code",
    "projectId.description", // Assuming projectId.title is now projectId.description or similar based on your schema
    "assignedTo.name",
    "assignedTo.email",
    "assignedTo.role"
];

// const buildGlobalSearchMatch = (search, fields) => {
//     const regex = new RegExp(search, "i");
//     return {
//         $or: fields.map(field => ({
//             [field]: { $regex: regex }
//         }))
//     };
// };



module.exports = {

    // Queries
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
    getUser: async ({ id }) => await User.findById(id).select('-password'),

    //reports
    getTotalTodos: async () => {
        return await Todo.countDocuments();
    },
    getTotalProjects: async () => {
        return await Project.countDocuments();
    },
    getTotalUsers: async () => {
        return await User.countDocuments();
    },
    getCompletedTodos: async () => {
        return await Todo.countDocuments({ completed: true });
    },

    getPendingTodos: async () => {
        return await Todo.countDocuments({ completed: false });
    },

    getUserTodosWithoutPagination: async ({ userId }) => {
        return await Todo.find({ assignedTo: userId })
            .populate('projectId')
            .populate('assignedTo');
    },

    // getUserTodos: async ({ userId, page = 1, limit = 10, search = "" }) => {
    //     const skip = (page - 1) * limit;
    //     const regex = new RegExp(search, "i");

    //     const pipeline = [
    //         {
    //             $match: {
    //                 assignedTo: new mongoose.Types.ObjectId(userId)
    //             }
    //         },
    //         {
    //             $lookup: {
    //                 from: 'projects',
    //                 localField: 'projectId',
    //                 foreignField: '_id',
    //                 as: 'projectId'
    //             }
    //         },
    //         { $unwind: { path: '$projectId', preserveNullAndEmptyArrays: true } },
    //         {
    //             $lookup: {
    //                 from: 'users',
    //                 localField: 'assignedTo',
    //                 foreignField: '_id',
    //                 as: 'assignedTo'
    //             }
    //         },
    //         { $unwind: { path: '$assignedTo', preserveNullAndEmptyArrays: true } },
    //         {
    //             $match: {
    //                 $or: [
    //                     // Fields from Todo
    //                     { title: { $regex: regex } },
    //                     { description: { $regex: regex } },
    //                     { status: { $regex: regex } },

    //                     // Fields from Project
    //                     { 'projectId.name': { $regex: regex } },
    //                     { 'projectId.code': { $regex: regex } },
    //                     { 'projectId.description': { $regex: regex } },

    //                     // Fields from User
    //                     { 'assignedTo.name': { $regex: regex } },
    //                     { 'assignedTo.email': { $regex: regex } },
    //                     { 'assignedTo.role': { $regex: regex } }
    //                 ]
    //             }
    //         },
    //         {
    //             $facet: {
    //                 data: [
    //                     { $skip: skip },
    //                     { $limit: limit }
    //                 ],
    //                 totalCount: [
    //                     { $count: "count" }
    //                 ]
    //             }
    //         }
    //     ];

    //     const result = await Todo.aggregate(pipeline);
    //     const todos = result[0].data;
    //     const total = result[0].totalCount[0]?.count || 0;

    //     return {
    //         todos,
    //         total,
    //         page,
    //         pages: Math.ceil(total / limit)
    //     };
    // },

    // getUserTodos: async ({ userId, page = 1, limit = 10, search = "" }) => {
    //     const skip = (page - 1) * limit;
    //     const searchableFields = [
    //         "title",
    //         "description",
    //         "status",
    //         "projectId.name",
    //         "projectId.code",
    //         "projectId.description",
    //         "assignedTo.name",
    //         "assignedTo.email",
    //         "assignedTo.role"
    //     ];

    //     const pipeline = [
    //         {
    //             $match: {
    //                 assignedTo: new mongoose.Types.ObjectId(userId)
    //             }
    //         },
    //         {
    //             $lookup: {
    //                 from: 'projects',
    //                 localField: 'projectId',
    //                 foreignField: '_id',
    //                 as: 'projectId'
    //             }
    //         },
    //         { $unwind: { path: '$projectId', preserveNullAndEmptyArrays: true } },
    //         {
    //             $lookup: {
    //                 from: 'users',
    //                 localField: 'assignedTo',
    //                 foreignField: '_id',
    //                 as: 'assignedTo'
    //             }
    //         },
    //         { $unwind: { path: '$assignedTo', preserveNullAndEmptyArrays: true } },
    //         ...(search
    //             ? [{ $match: buildGlobalSearchMatch(search, searchableFields) }]
    //             : []
    //         ),
    //         {
    //             $facet: {
    //                 data: [{ $skip: skip }, { $limit: limit }],
    //                 totalCount: [{ $count: "count" }]
    //             }
    //         }
    //     ];

    //     const result = await Todo.aggregate(pipeline);
    //     const todos = result[0].data;
    //     const total = result[0].totalCount[0]?.count || 0;

    //     return {
    //         todos,
    //         total,
    //         page,
    //         pages: Math.ceil(total / limit)
    //     };
    // },


    // export const resolvers = {
    //     Query: {

    //         // ... other resolvers
    //     },
    //     // ... other types resolvers if any
    // },


    // getUserTodos: async ({ userId, page = 1, limit = 10, search = "" }) => {
    //     const skip = (page - 1) * limit;
    //     const searchableFields = [
    //         "title",
    //         "description",
    //         "status",
    //         "projectId.name",
    //         "projectId.code",
    //         "projectId.description",
    //         "assignedTo.name",
    //         "assignedTo.email",
    //         "assignedTo.role"
    //     ];

    //     const pipeline = [
    //         {
    //             $match: {
    //                 assignedTo: new mongoose.Types.ObjectId(userId)
    //             }
    //         },
    //         {
    //             $lookup: {
    //                 from: 'projects',
    //                 localField: 'projectId',
    //                 foreignField: '_id',
    //                 as: 'projectId'
    //             }
    //         },
    //         { $unwind: { path: '$projectId', preserveNullAndEmptyArrays: true } },
    //         // Add id field to projectId if it exists
    //         {
    //             $addFields: {
    //                 "projectId.id": "$projectId._id"
    //             }
    //         },
    //         {
    //             $lookup: {
    //                 from: 'users',
    //                 localField: 'assignedTo',
    //                 foreignField: '_id',
    //                 as: 'assignedTo'
    //             }
    //         },
    //         { $unwind: { path: '$assignedTo', preserveNullAndEmptyArrays: true } },
    //         // Add id field to assignedTo if it exists
    //         {
    //             $addFields: {
    //                 "assignedTo.id": "$assignedTo._id"
    //             }
    //         },
    //         // Add id for the main Todo document
    //         {
    //             $addFields: {
    //                 id: '$_id'
    //             }
    //         },
    //         ...(search
    //             ? [{ $match: buildGlobalSearchMatch(search, searchableFields) }]
    //             : []
    //         ),
    //         // Optional: If you strictly need assignedTo and projectId to be non-null,
    //         // you could add a $match stage here to filter out todos where these are null.
    //         // {
    //         //     $match: {
    //         //         assignedTo: { $ne: null },
    //         //         projectId: { $ne: null }
    //         //     }
    //         // },
    //         {
    //             $facet: {
    //                 data: [{ $skip: skip }, { $limit: limit }],
    //                 totalCount: [{ $count: "count" }]
    //             }
    //         }
    //     ];

    //     const result = await Todo.aggregate(pipeline);
    //     const todos = result[0].data;
    //     const total = result[0].totalCount[0]?.count || 0;

    //     return {
    //         todos,
    //         total,
    //         page,
    //         pages: Math.ceil(total / limit)
    //     };
    // },

    // getUserTodos: async ({ userId, page = 1, limit = 10, search = "", pagination = true }) => {
    //     const skip = (page - 1) * limit;
    //     const searchableFields = [
    //         "title",
    //         "description",
    //         "status",
    //         "projectId.name",
    //         "projectId.code",
    //         "projectId.title",
    //         "projectId.description",
    //         "assignedTo.name",
    //         "assignedTo.email",
    //         "assignedTo.role"
    //     ];

    //     // Base pipeline that always applies
    //     let pipeline = [
    //         {
    //             $match: {
    //                 assignedTo: new mongoose.Types.ObjectId(userId)
    //             }
    //         },
    //         {
    //             $lookup: {
    //                 from: 'projects',
    //                 localField: 'projectId',
    //                 foreignField: '_id',
    //                 as: 'projectId'
    //             }
    //         },
    //         { $unwind: { path: '$projectId', preserveNullAndEmptyArrays: true } },
    //         {
    //             $addFields: {
    //                 "projectId.id": "$projectId._id"
    //             }
    //         },
    //         {
    //             $lookup: {
    //                 from: 'users',
    //                 localField: 'assignedTo',
    //                 foreignField: '_id',
    //                 as: 'assignedTo'
    //             }
    //         },
    //         { $unwind: { path: '$assignedTo', preserveNullAndEmptyArrays: true } },
    //         {
    //             $addFields: {
    //                 "assignedTo.id": "$assignedTo._id"
    //             }
    //         },
    //         {
    //             $addFields: {
    //                 id: '$_id'
    //             }
    //         },
    //         ...(search
    //             ? [{ $match: buildGlobalSearchMatch(search, searchableFields) }]
    //             : []
    //         ),
    //     ];

    //     let todos;
    //     let total;
    //     let pages;

    //     if (pagination) {
    //         // If pagination is true, add the $facet stage
    //         pipeline.push({
    //             $facet: {
    //                 data: [{ $skip: skip }, { $limit: limit }],
    //                 totalCount: [{ $count: "count" }]
    //             }
    //         });

    //         const result = await Todo.aggregate(pipeline);
    //         todos = result[0].data;
    //         total = result[0].totalCount[0]?.count || 0;
    //         pages = Math.ceil(total / limit);

    //     } else {
    //         // If pagination is false, just execute the pipeline to get all matching todos
    //         // without $facet, $skip, or $limit in the main aggregation
    //         const result = await Todo.aggregate(pipeline);
    //         todos = result; // All documents matching the criteria
    //         total = todos.length; // Total is simply the count of results
    //         pages = 1; // When no pagination, there's effectively 1 page
    //     }

    //     return {
    //         todos,
    //         total,
    //         page,
    //         pages
    //     };
    // },


    // getUserTodos: async ({ userId, page = 1, limit = 10, search = "", pagination = true }) => {
    //     const skip = (page - 1) * limit;

    //     // Dynamically generate searchable fields
    //     const searchableFields = getSearchableFields(
    //         Todo,
    //         EXCLUDED_TODO_FIELDS,
    //         NESTED_SEARCHABLE_FIELDS
    //     );

    //     let pipeline = [
    //         {
    //             $match: {
    //                 assignedTo: new mongoose.Types.ObjectId(userId)
    //             }
    //         },
    //         {
    //             $lookup: {
    //                 from: 'projects',
    //                 localField: 'projectId',
    //                 foreignField: '_id',
    //                 as: 'projectId'
    //             }
    //         },
    //         { $unwind: { path: '$projectId', preserveNullAndEmptyArrays: true } },
    //         {
    //             $addFields: {
    //                 "projectId.id": "$projectId._id"
    //             }
    //         },
    //         {
    //             $lookup: {
    //                 from: 'users',
    //                 localField: 'assignedTo',
    //                 foreignField: '_id',
    //                 as: 'assignedTo'
    //             }
    //         },
    //         { $unwind: { path: '$assignedTo', preserveNullAndEmptyArrays: true } },
    //         {
    //             $addFields: {
    //                 "assignedTo.id": "$assignedTo._id"
    //             }
    //         },
    //         {
    //             $addFields: {
    //                 id: '$_id'
    //             }
    //         },
    //         ...(search
    //             ? [{ $match: buildGlobalSearchMatch(search, searchableFields) }]
    //             : []
    //         ),
    //     ];

    //     let todos;
    //     let total;
    //     let pages;

    //     if (pagination) {
    //         pipeline.push({
    //             $facet: {
    //                 data: [{ $skip: skip }, { $limit: limit }],
    //                 totalCount: [{ $count: "count" }]
    //             }
    //         });

    //         const result = await Todo.aggregate(pipeline);
    //         todos = result[0].data;
    //         total = result[0].totalCount[0]?.count || 0;
    //         pages = Math.ceil(total / limit);
    //         message = "Pagination applied, returning limited todos.";

    //     } else {
    //         const result = await Todo.aggregate(pipeline);
    //         todos = result;
    //         total = todos.length;
    //         pages = 1;
    //         message = "No pagination applied, returning all matching todos.";
    //     }
    //     return {
    //         todos,
    //         total,
    //         page,
    //         pages,
    //         message
    //     }
    // },


    getUserTodos: async ({ userId, page = 1,
        limit = 10,
        search = "",
        pagination = true
    }) => {
        const skip = (page - 1) * limit;

        // Dynamically generate searchable fields
        const searchableFields = getSearchableFields(
            Todo,
            EXCLUDED_TODO_FIELDS,
            NESTED_SEARCHABLE_FIELDS
        );

        // console.log("Incoming Params:", { userId, page, limit, search, pagination });
        // console.log("Searchable Fields:", searchableFields);

        let pipeline = [
            {
                $match: {
                    assignedTo: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'projectId',
                    foreignField: '_id',
                    as: 'projectId'
                }
            },
            {
                $unwind: {
                    path: '$projectId',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    "projectId.id": "$projectId._id"
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'assignedTo'
                }
            },
            {
                $unwind: {
                    path: '$assignedTo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    "assignedTo.id": "$assignedTo._id"
                }
            },
            {
                $addFields: {
                    id: '$_id'
                }
            }
        ];

        // Add search filter if present
        if (search) {
            const searchMatch = buildGlobalSearchMatch(search, searchableFields);
            // console.log("Search Match Condition:", JSON.stringify(searchMatch, null, 2));
            pipeline.push({ $match: searchMatch });
        }

        let todos = [];
        let total = 0;
        let pages = 1;
        let message = "";

        if (pagination) {
            pipeline.push({
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{ $count: "count" }]
                }
            });

            const result = await Todo.aggregate(pipeline);
            const facet = result[0] || { data: [], totalCount: [] };

            todos = facet.data || [];
            total = facet.totalCount?.[0]?.count || 0;
            pages = Math.ceil(total / limit);
            message = "Pagination applied, returning limited todos.";
        } else {
            const result = await Todo.aggregate(pipeline);
            todos = result;
            total = todos.length;
            pages = 1;
            message = "No pagination applied, returning all matching todos.";
        }

        return {
            todos,
            total,
            page,
            pages,
            message
        };
    },

    getUserProjects: async ({ userId }) => {
        return await Project.find({ members: userId })
            .populate('members', 'name email');
    },
    // Mutations
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

        const savedTodo = await todo.save();

        // Re-fetch with populate
        return await Todo.findById(savedTodo._id)
            .populate('projectId')
            .populate('assignedTo');
    },
    updateTodo: async ({ id, input }) => {
        return await Todo.findByIdAndUpdate(id, input, { new: true });
    },
    deleteTodo: async ({ id }) => {
        await Todo.findByIdAndDelete(id);
        return "Todo deleted";
    },
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

// get to-do with project and assigned user:
// mutation {
//     addTodo(input: {
//       title: "Build GraphQL schema",
//       completed: false,
//       projectId: "6859014f16e61dcbc97bd90b",
//       assignedTo: "685900f6f64b973bce8922ad"
//     }) {
//       id
//       title
//       completed
//       projectId{
//         id
//         name
//         description
//       }
//       assignedTo{
//         id
//         name
//         email
//       }
//     }
//   }

// get a specific to-do by ID:
// query {
//     getTodo(id: "68590440b976c4c2e71e9a44") {
//       id
//       title
//       completed
//       projectId {
//         id
//         name
//         description
//       }
//       assignedTo {
//         id
//         name
//         email
//       }
//     }
//   }

//  get all to-dos with pagination and search with project and assigned user details:
// {
//     getTodos(page: 1, limit: 4, search: "") {
//       id
//       title
//       completed
//       projectId{
//         id
//         name
//       }
//       assignedTo{
//         id
//         name
//         email
//       }
//     }
//   }

// get user todos with assigned user and project details:
// {
//     getUserTodos(userId: "685900f6f64b973bce8922ad", page:1,limit:100, search: "update") {
//       todos {
//         id
//         title
//         description
//         completed
//         assignedTo {
//           id
//           name
//           email
//         }
//         projectId {
//           id
//           name
//           description
//         }
//       }
//       total
//       page
//       pages
//     }
//   }






