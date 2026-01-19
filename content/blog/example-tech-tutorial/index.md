---
title: "Building Your First REST API with Node.js and Express"
date: 2025-06-20
author: "Alex Johnson"
description: "A beginner-friendly guide to creating a REST API using Node.js and Express framework with practical examples."
topic: "tutorial"
tags: ["javascript", "nodejs", "api", "express", "beginners", "backend"]
featured: false
image: "nodejs-api-cover.jpg"
readingTime: 8
---

Building REST APIs is a fundamental skill for modern web developers. In this tutorial, we'll create a complete REST API using Node.js and Express, perfect for beginners who want to understand backend development.

## What You'll Learn

By the end of this tutorial, you'll have built a functional REST API that can:

- Handle GET, POST, PUT, and DELETE requests
- Manage data with proper error handling
- Implement middleware for logging and validation
- Structure your project for scalability

<!--more-->

## Prerequisites

Before we start, make sure you have:

- Node.js installed (version 14 or higher)
- Basic understanding of JavaScript
- A text editor (VS Code recommended)
- Postman or similar API testing tool

## Setting Up the Project

First, let's create a new project and install the necessary dependencies:

```bash
mkdir my-first-api
cd my-first-api
npm init -y
npm install express cors helmet dotenv
npm install -D nodemon
```

## Project Structure

Let's organize our project with a clean structure:

```text
my-first-api/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── routes/
├── .env
├── .gitignore
├── package.json
└── server.js
```

## Creating the Basic Server

Start by creating the main server file:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to my first API!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

## Building the API Routes

Let's create a simple books API to demonstrate CRUD operations:

```javascript
// src/routes/books.js
const express = require('express');
const router = express.Router();

// Sample data (in a real app, this would be a database)
let books = [
    { id: 1, title: 'The JavaScript Way', author: 'Baptiste Pesquet', year: 2018 },
    { id: 2, title: 'Clean Code', author: 'Robert Martin', year: 2008 }
];

// GET all books
router.get('/', (req, res) => {
    res.json(books);
});

// GET book by ID
router.get('/:id', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
});

// POST new book
router.post('/', (req, res) => {
    const { title, author, year } = req.body;
    
    if (!title || !author || !year) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newBook = {
        id: books.length + 1,
        title,
        author,
        year: parseInt(year)
    };
    
    books.push(newBook);
    res.status(201).json(newBook);
});

// PUT update book
router.put('/:id', (req, res) => {
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }
    
    const { title, author, year } = req.body;
    books[bookIndex] = { ...books[bookIndex], title, author, year };
    
    res.json(books[bookIndex]);
});

// DELETE book
router.delete('/:id', (req, res) => {
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }
    
    books.splice(bookIndex, 1);
    res.status(204).send();
});

module.exports = router;
```

## Adding Middleware

Create a simple logging middleware:

```javascript
// src/middleware/logger.js
const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.path}`);
    next();
};

module.exports = logger;
```

## Putting It All Together

Update your server.js to use the routes and middleware:

```javascript
// server.js (updated)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./src/middleware/logger');
const booksRouter = require('./src/routes/books');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.use('/api/books', booksRouter);

app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to my first API!',
        endpoints: {
            books: '/api/books'
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

## Testing Your API

You can test your API using these curl commands:

```bash
# Get all books
curl http://localhost:3000/api/books

# Get a specific book
curl http://localhost:3000/api/books/1

# Create a new book
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Node.js in Action","author":"Alex Young","year":2017}'

# Update a book
curl -X PUT http://localhost:3000/api/books/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","author":"Updated Author","year":2023}'

# Delete a book
curl -X DELETE http://localhost:3000/api/books/1
```

## Next Steps

Congratulations! You've built your first REST API. Here are some improvements you can make:

1. **Add a Database** - Replace the in-memory array with MongoDB or PostgreSQL
2. **Authentication** - Implement JWT-based authentication
3. **Validation** - Use libraries like Joi for input validation
4. **Testing** - Write unit tests with Jest
5. **Documentation** - Use Swagger for API documentation

## Conclusion

Building REST APIs with Node.js and Express is straightforward once you understand the fundamentals. This tutorial covered the basics, but there's much more to explore in backend development.

Keep practicing, and don't hesitate to ask questions in our Code & Coffee meetups!
