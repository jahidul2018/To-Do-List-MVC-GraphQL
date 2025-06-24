// src/app.js (Simplified setup for demonstration)
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';

import typeDefs from './graphql/schemas';
import { resolvers } from './graphql/resolvers';
import todoRoutes from './routes/todoRoutes'; // Import your REST routes

const startServer = async () => {
    const app = express();

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/your_database', {
        // useNewUrlParser: true, // Deprecated in newer Mongoose versions
        // useUnifiedTopology: true, // Deprecated in newer Mongoose versions
    });
    console.log('Connected to MongoDB');

    // Setup Apollo Server for GraphQL
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        // context: ({ req }) => ({ req }), // Example context if needed
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app, path: '/graphql' });

    // Setup REST API routes
    app.use('/api/todos', todoRoutes);

    const PORT = 4000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
        console.log(`REST API endpoint: http://localhost:${PORT}/api/todos/user/:userId`);
    });
};

startServer();