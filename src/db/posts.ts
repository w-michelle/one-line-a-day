import mongoose from "mongoose";
import { Schema } from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

const PostModel = mongoose.model("Post", PostSchema);

export const getPosts = () =>
  PostModel.find().populate("author", "username profile membership");

export const getPostById = (authorId: string) =>
  PostModel.find({ author: authorId }).populate(
    "author",
    "username profile membership",
  );

export const createNewPost = (values: Record<string, any>) =>
  new PostModel(values).save().then((post) => post.toObject());

export const deletePostById = (id: string) =>
  PostModel.findOneAndDelete({ _id: id });
