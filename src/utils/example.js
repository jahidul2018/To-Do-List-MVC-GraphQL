// resolver/index.js
import mongoose from 'mongoose';
import Todo from '../models/Todo';
import User from '../models/User'; // Assuming your User model is here
import Project from '../models/Project'; // Assuming your Project model is here

import { buildGlobalSearchMatch, getSearchableFields } from '../utils/search';

// Define excluded fields (common ones that usually aren't searched)
const EXCLUDED_TODO_FIELDS = [
    '_id',        // Mapped to 'id', usually not searched directly
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


export const resolvers = {
    Query: {
        getUserTodos: async ({ userId, page = 1, limit = 10, search = "", pagination = true }) => {
            const skip = (page - 1) * limit;

            // Dynamically generate searchable fields
            const searchableFields = getSearchableFields(
                Todo,
                EXCLUDED_TODO_FIELDS,
                NESTED_SEARCHABLE_FIELDS
            );

            // console.log("Searchable Fields:", searchableFields); // For debugging

            // Base pipeline that always applies
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
        },
    },
};