import jwt from "jsonwebtoken";
import express from "express";
import { TokenPayload } from "../types/types";
import { getUserById } from "../db/users";

export const attachCurrentUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const token = req.cookies["cbblog-auth"];

    if (!token) {
      res.locals.currentUser = null;
      return next();
    }

    // let decoded: TokenPayload;
    try {
      const secret = process.env.TOKEN_SECRET;
      if (!secret) {
        throw new Error("TOKEN_SECRET is not defined");
      }
      const decoded = jwt.verify(token, secret);

      if (typeof decoded === "string" || !decoded || !("userId" in decoded)) {
        res.locals.currentUser = null;
        return next();
      }

      const user = await getUserById(decoded.userId as string);

      res.locals.currentUser = user || null;
      next();
    } catch {
      res.locals.currentUser = null;
      return next();
    }
  } catch (error) {
    res.locals.currentUser = null;
    return next();
  }
};
