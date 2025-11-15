// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const airtableRoutes = require('./routes/airtableRoutes'); // We'll create this next

const app = express();
const PORT = process.env.PORT || 3000; // Use environment port or default

// --- Uploads directory ---
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// --- Middleware ---
app.use(cors()); // Allow requests from different origins (like your frontend)
app.use(express.json({ limit: '15mb' })); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true, limit: '15mb' })); // Parse URL-encoded requests
app.use('/uploads', express.static(uploadsDir));

// --- Logging Middleware (Optional but helpful) ---
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// --- Routes ---
app.use('/api', airtableRoutes); // Mount our Airtable specific routes

// --- Basic Root Route ---
app.get('/', (req, res) => {
    res.send('Airtable Backend API is running!');
});

// --- Global Error Handler (Basic) ---
app.use((err, req, res, next) => {
    console.error("Global Error Handler Caught:");
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'An unexpected server error occurred.',
        error: process.env.NODE_ENV === 'development' ? err : {} // Only show stack in dev
    });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    if (!process.env.AIRTABLE_PAT || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_TABLE_ID) {
        console.warn('WARN: Airtable environment variables (PAT, BASE_ID, TABLE_ID) are not fully set. API calls might fail.');
    }
});
