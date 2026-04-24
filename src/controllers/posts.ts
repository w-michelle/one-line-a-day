import { createNewPost, deletePostById, getPostById } from "../db/posts";
import express from "express";
import dotenv from "dotenv";
import { formatDate } from "../helpers/formatDate";

dotenv.config();

export const userPostsPage = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const currentUser = res.locals.currentUser;
    const allUserPosts = await getPostById(currentUser?._id);
    return res.render("pages/userPosts", {
      title: "User's Posts",
      posts: allUserPosts,
      formatDate,
      error: null,
    });
  } catch (error) {
    return res.status(500).send("Something went wrong");
  }
};

export const createPostPage = async (
  req: express.Request,
  res: express.Response,
) => {
  return res.render("pages/post", { title: "Create Post", error: null });
};

export const createPost = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { content } = req.body;

    const currentUser = res.locals.currentUser;

    if (!currentUser || !content) {
      return res.status(400).render("pages/post", {
        title: "Create Post",
        error: "Content cannot be empty",
      });
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return res.status(400).render("pages/post", {
        title: "Create Post",
        error: "Content cannot be empty",
      });
    }

    const addPost = await createNewPost({
      author: currentUser._id,
      content: trimmedContent,
    });

    return res.redirect("/");
  } catch (error) {
    return res.status(500).render("pages/post", {
      title: "Create Post",
      error: "Something went wrong. Please try again",
    });
  }
};

export const deletePost = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { id } = req.params;

    await deletePostById(id);

    const currentUser = res.locals.currentUser;

    if (!currentUser) {
      return res.redirect("/login");
    }

    return res.redirect(`/userPosts/${currentUser?.id}`);
  } catch (error) {
    return res.status(400).render("pages/error", {
      error: "Failed to delete post",
    });
  }
};
