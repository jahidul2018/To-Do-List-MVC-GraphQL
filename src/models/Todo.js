const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String, // optional
    dueDate: Date, // optional
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }, // optional
    tags: [{ type: String }], // optional tags for the to-do
    attachments: [{ type: String }], // optional file attachments for the to-do
    notes: [{ type: String }], // optional notes for the to-do
    subtasks: [
        {
            title: { type: String, required: true },
            completed: { type: Boolean, default: false },
            dueDate: Date, // optional
            priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }, // optional
            tags: [{ type: String }], // optional tags for the subtask
            attachments: [{ type: String }], // optional file attachments for the subtask
            notes: [{ type: String }] // optional notes for the subtask
        }
    ], // optional array of subtasks
    completed: { type: Boolean, default: false },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Todo', todoSchema);
