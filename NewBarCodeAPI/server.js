// Import the 'app' module
const app = require("./app");

// Start the server and make it listen on a specified port
app.listen(process.env.PORT || 9000, () => {
  // Print a message to the console when the server starts
  console.log("server starting on port 9000!");
});

