const http = require("http");
const { MongoClient } = require("mongodb");

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "testdb";

let dbStatus = "disconnected";
let client;

// Connect to MongoDB on startup
MongoClient.connect(MONGO_URI)
  .then((c) => {
    client = c;
    dbStatus = "connected";
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    dbStatus = `error: ${err.message}`;
    console.error("❌ MongoDB connection failed:", err.message);
  });

// Simple router
const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  // GET /health — checks if MongoDB is connected
  if (req.method === "GET" && req.url === "/health") {
    const status = dbStatus === "connected" ? 200 : 503;
    res.writeHead(status);
    return res.end(JSON.stringify({ status: "ok", mongo: dbStatus }));
  }

  // GET /ping-db — does a live ping to MongoDB
  if (req.method === "GET" && req.url === "/ping-db") {
    if (!client) {
      res.writeHead(503);
      return res.end(JSON.stringify({ success: false, message: "MongoDB not connected" }));
    }
    try {
      await client.db(DB_NAME).command({ ping: 1 });
      res.writeHead(200);
      return res.end(JSON.stringify({ success: true, message: "MongoDB ping successful" }));
    } catch (err) {
      res.writeHead(500);
      return res.end(JSON.stringify({ success: false, message: err.message }));
    }
  }

  // 404 fallback
  res.writeHead(404);
  res.end(JSON.stringify({ error: "Route not found" }));
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
