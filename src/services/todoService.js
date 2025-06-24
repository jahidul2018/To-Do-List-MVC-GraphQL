// services/todoService.js
// import mongoose from 'mongoose';
const mongoose = require('mongoose');
const Todo = require('../models/Todo'); // Adjust the path as necessary
const { buildGlobalSearchMatch, getSearchableFields } = require('../utils/search'); // Adjust the path as necessary


// Define excluded fields (common ones that usually aren't searched)
const EXCLUDED_TODO_FIELDS = [

    'subtasks',
    'attachments',
    'notes',
    'dueDate',
    'priority',
    'tags',
    'completed'
];

// Define nested fields from lookups that you want to be searchable
const NESTED_SEARCHABLE_FIELDS = [
    "projectId.name",
    "projectId.code",
    "projectId.description",
    "assignedTo.name",
    "assignedTo.email",
    "assignedTo.role"
];


const getTodosForUser = async (_parent, args) => { // Change this line
    // Destructure params inside, providing a default empty object in case params is undefined
    // const { userId, page = 1, limit = 10, search = "", pagination = true } = params || {};
    const { userId, page = 1, limit = 10, search = "", pagination = true } = args || {};
    if (!userId) throw new Error("userId is required");


    const skip = (page - 1) * limit;

    // Dynamically generate searchable fields
    const searchableFields = getSearchableFields(
        Todo,
        EXCLUDED_TODO_FIELDS,
        NESTED_SEARCHABLE_FIELDS
    );

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
        { $unwind: { path: '$projectId', preserveNullAndEmptyArrays: true } },
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
        { $unwind: { path: '$assignedTo', preserveNullAndEmptyArrays: true } },
        {
            $addFields: {
                "assignedTo.id": "$assignedTo._id"
            }
        },
        {
            $addFields: {
                id: '$_id'
            }
        },
        ...(search
            ? [{ $match: buildGlobalSearchMatch(search, searchableFields) }]
            : []
        ),
    ];

    let todos;
    let total;
    let pages;

    if (pagination) {
        pipeline.push({
            $facet: {
                data: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: "count" }]
            }
        });

        const result = await Todo.aggregate(pipeline);
        todos = result[0].data;
        total = result[0].totalCount[0]?.count || 0;
        pages = Math.ceil(total / limit);

    } else {
        const result = await Todo.aggregate(pipeline);
        todos = result;
        total = todos.length;
        pages = 1;
    }

    return {
        todos,
        total,
        page,
        pages
    };
};


module.exports = {
    getTodosForUser
};