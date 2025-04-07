const { createClient } = require('@supabase/supabase-js');

// Replace with your own Supabase project URL and API key
const SUPABASE_URL = 'https://your-project-ref.supabase.co'; // TODO: replace
const SUPABASE_KEY = 'your-anon-key-or-service-role-key'; // TODO: replace
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* --------------------------
   Authentication Example
-------------------------- */
async function signUpUser(email, password) {
  const { user, session, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    console.error("Error signing up:", error.message);
    return;
  }
  console.log("User signed up successfully:", user);
}

/* --------------------------
   File Storage Example
-------------------------- */
async function uploadFile(bucketName, filePath, fileContent) {
  // fileContent can be a string, Blob, or Buffer.
  const { data, error } = await supabase.storage.from(bucketName).upload(filePath, fileContent);
  if (error) {
    console.error("Error uploading file:", error.message);
    return;
  }
  console.log("File uploaded successfully:", data);
}

/* --------------------------
   Main Execution
-------------------------- */
(async () => {
  // Replace these with actual test values.
  await signUpUser('test@example.com', 'password123');

  // For demonstration, we use a simple string as file content.
  // In production, you might use a file stream or Buffer.
  await uploadFile('my-files', 'folder/test.txt', 'Hello, Supabase!');
})();
