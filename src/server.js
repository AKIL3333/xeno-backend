// server.js
const dotenv = require("dotenv");
dotenv.config();

const app = require("./app"); // <-- import your app.js where all routes are mounted
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
