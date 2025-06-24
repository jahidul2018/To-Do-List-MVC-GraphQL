const buildGlobalSearchMatch = (search, fields) => {
    const regex = new RegExp(search, "i");
    return {
        $or: fields.map(field => ({
            [field]: { $regex: regex }
        }))
    };
};

// --- New Helper Function (can be in a separate utils file or here) ---
const getSearchableFields = (model, excludedFields = [], nestedFields = []) => {
    const fields = new Set();

    // Add top-level fields from the model's schema
    for (const path in model.schema.paths) {
        if (!excludedFields.includes(path) && !path.includes('.')) { // Exclude nested paths (like subtasks.0.title) and excluded fields
            fields.add(path);
        }
    }

    // Add manually specified nested fields
    nestedFields.forEach(field => fields.add(field));

    return Array.from(fields);
};

module.exports = {
    buildGlobalSearchMatch,
    getSearchableFields
};

