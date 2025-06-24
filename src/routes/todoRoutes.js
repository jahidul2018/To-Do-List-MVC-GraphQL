// src/routes/todoRoutes.js (or directly in your main app.js if simple)
import express from 'express';
import { getTodosForUser } from '../services/todoService'; // Import the service

const router = express.Router();

// GET /api/todos/user/:userId
// Query params: page, limit, search, pagination (e.g., /api/todos/user/123?page=1&limit=10&search=task&pagination=false)
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { page, limit, search, pagination } = req.query;

        // Convert query params to the expected types for the service function
        const parsedPage = page ? parseInt(page, 10) : undefined;
        const parsedLimit = limit ? parseInt(limit, 10) : undefined;
        const parsedPagination = pagination !== undefined ? (pagination === 'true') : undefined;

        // Call the reusable service function
        const todosData = await getTodosForUser({
            userId,
            page: parsedPage,
            limit: parsedLimit,
            search: search,
            pagination: parsedPagination
        });

        res.status(200).json(todosData);
    } catch (error) {
        console.error("Error fetching user todos via REST:", error);
        res.status(500).json({ message: "Failed to retrieve todos", error: error.message });
    }
});

export default router;

// In your app.js or server.js, you'd then use it like:
// import todoRoutes from './routes/todoRoutes';
// app.use('/api/todos', todoRoutes);