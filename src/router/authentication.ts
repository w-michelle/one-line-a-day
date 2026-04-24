import { requireAuth } from "./../middleware/requireAuth";
import express from "express";

import {
  joinPage,
  login,
  loginPage,
  logOut,
  register,
  registerPage,
  testerLogin,
  verifyCode,
} from "../controllers/authentication";

export default (router: express.Router) => {
  //pages

  router.get("/login", loginPage);
  router.get("/register", registerPage);
  router.get("/join", requireAuth, joinPage);

  router.post("/auth/register", register);
  router.post("/auth/login", login);
  router.post("/auth/tester-login", testerLogin);

  router.post("/auth/join/:id", requireAuth, verifyCode);
  router.post("/logout", requireAuth, logOut);
};
