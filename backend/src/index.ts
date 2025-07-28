import express from "express";
import dotenv from "dotenv";
dotenv.config();

import spotifyRouter from "./routes/spotify";

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Berlin Events API is running.");
});

app.use("/spotify", spotifyRouter);

export default app;
