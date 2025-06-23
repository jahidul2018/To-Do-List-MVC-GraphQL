require('dotenv').config();
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const schema = require('./src/schemas');
const resolvers = require('./src/resolvers');
const authMiddleware = require('./src/middleware/auth');
const app = express();
const cors = require('cors');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err));

// GraphQL route
app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true
}));

app.use(cors());
// Middleware for authentication
app.use(authMiddleware);
// Basic route for health check
app.get('/', (req, res) => {
    res.send('Welcome to the GraphQL API');
});
// Middleware to parse JSON requests
// app.use(express.json());
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

