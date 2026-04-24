import express from "express";
import { getPosts } from "../db/posts";
import { getVisiblePosts } from "../helpers/posts";
import { formatDate } from "../helpers/formatDate";
export const homePage = async (req: express.Request, res: express.Response) => {
  try {
    const posts = await getPosts();
    const currentUser = res.locals.currentUser;
    const visiblePosts = getVisiblePosts(posts, currentUser);

    return res.render("pages/index", {
      title: "Home",
      posts: visiblePosts,
      formatDate,
    });
  } catch (error) {
    return res.status(500).send("Something went wrong");
  }
};
