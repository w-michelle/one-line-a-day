import express from "express";
import authentication from "./authentication";
import post from "./post";
import home from "./home";
const router = express.Router();

export default (): express.Router => {
  home(router);
  authentication(router);
  post(router);

  return router;
};
