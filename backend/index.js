// index.js
require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies.
app.use(express.json());

// Retrieve Supabase credentials from environment variables.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Supabase credentials are missing in environment variables.');
  process.exit(1);
}

// Create a Supabase client.
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* --------------------------
   REST API Endpoints
-------------------------- */

// Test Endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Supabase API TEST!');
});

// Endpoint to sign up a new user.
app.post('/signup', async (req, res) => {
  console.log('Received request at /signup:', req.body); // Log the request body for debugging
  //try {
  //  const { email, password } = req.body;
  //  if (!email || !password) {
  //    return res.status(400).json({ error: 'Email and password are required' });
  //  }
  //
  //  const { user, session, error } = await supabase.auth.signUp({ email, password });
  //  if (error) {
  //    return res.status(400).json({ error: error.message });
  //  }
  //
  //  res.json({ user, session });
  //} catch (err) {
  //  console.error('Error in /signup:', err);
  //  res.status(500).json({ error: 'Internal server error' });
  //}
});

// Endpoint to upload a file to a specified storage bucket.
// For simplicity, this example accepts the file content as a string.
app.post('/upload', async (req, res) => {
  try {
    const { bucket, path, content } = req.body;
    if (!bucket || !path || !content) {
      return res.status(400).json({ error: 'Bucket, path, and content are required' });
    }

    const { data, error } = await supabase.storage.from(bucket).upload(path, content);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ data });
  } catch (err) {
    console.error('Error in /upload:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server.
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
