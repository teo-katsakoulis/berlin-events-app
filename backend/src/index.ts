import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Example route
app.get("/", (_req, res) => {
  res.send("Berlin Events API is running.");
});

export default app;
