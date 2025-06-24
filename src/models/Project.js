const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    startDate: { type: Date, default: Date.now }, // optional
    endDate: Date, // optional
    status: { type: String, enum: ['not started', 'in progress', 'completed', 'on hold'], default: 'not started' }, // optional
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Todo' }], // reference to tasks associated with the project
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // references to users associated with the project
    tags: [{ type: String }], // optional tags for the project
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }, // optional priority level
    attachments: [{ type: String }], // optional file attachments for the project
    notes: [{ type: String }], // optional notes for the project
    isActive: { type: Boolean, default: true }, // optional flag to indicate if the project is active
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // reference to the user who created the project
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // reference to the user who last updated the project

}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
