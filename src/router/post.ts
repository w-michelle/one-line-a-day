import express from "express";

import {
  createPost,
  createPostPage,
  deletePost,
  userPostsPage,
} from "../controllers/posts";
import { requireAuth } from "../middleware/requireAuth";

export default (router: express.Router) => {
  router.get("/userPosts/:userId", requireAuth, userPostsPage);
  router.get("/createPost", requireAuth, createPostPage);
  router.post("/createPost", requireAuth, createPost);
  router.post("/post/:id", requireAuth, deletePost);
};
