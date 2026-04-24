import { attachCurrentUser } from "./src/middleware/attachCurrentUser";
import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongoose from "mongoose";
import router from "./src/router";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
const app = express();
const server = http.createServer(app);

// app.use(cors(corsOptions));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//ejs setup
app.set("views", path.join(__dirname, "src", "views"));
app.set("view engine", "ejs");

//static files
app.use(express.static(path.join(__dirname, "src", "public")));

app.use(attachCurrentUser);

app.use("/", router());

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const MONGO_URL = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_KEY}@cluster0.v8jjewz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.Promise = Promise;

mongoose.connect(MONGO_URL).catch((err) => {
  console.error("MongoDB connection error:", err.message);
});
mongoose.connection.on("error", (error: Error) => console.log(error));

export default app;
