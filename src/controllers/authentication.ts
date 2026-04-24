import { getPasscode } from "../db/passcode";
import {
  createUser,
  getUserByEmail,
  getUserById,
  getUserByUsername,
} from "../db/users";
import express from "express";
import { authentication, generateToken, random } from "../helpers";

//page rendering

export const loginPage = async (
  req: express.Request,
  res: express.Response,
) => {
  return res.render("pages/login", { title: "Login", error: null });
};

export const registerPage = async (
  req: express.Request,
  res: express.Response,
) => {
  return res.render("pages/register", { title: "Register", error: null });
};

export const joinPage = async (req: express.Request, res: express.Response) => {
  try {
    const currentUser = res.locals.currentUser;

    if (!currentUser) {
      return res.redirect("/login");
    }

    return res.render("pages/join", {
      title: "Join Membership",
      error: null,
    });
  } catch (error) {
    return res.redirect("/");
  }
};

//auth actions

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render("pages/login", {
        title: "Login",
        error: "Email and password are required.",
      });
    }

    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password",
    );

    if (!user) {
      return res.status(401).render("pages/login", {
        title: "Login",
        error: "Invalid email or password",
      });
    }

    //authenticate using hash comparison

    if (!user.authentication) {
      return res.status(500).render("pages/login", {
        title: "Login",
        error: "Invalid user data",
      });
    }

    const expectedHash = authentication(user.authentication.salt, password);

    if (user.authentication.password !== expectedHash) {
      return res.status(401).render("pages/login", {
        title: "Login",
        error: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    res.cookie("cbblog-auth", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect("/");
  } catch (error) {
    return res.sendStatus(400).render("/pages/login", {
      title: "Login",
      error: "Something went wrong",
    });
  }
};

export const verifyCode = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { id } = req.params;
    const { passcode } = req.body;

    const user = await getUserById(id);
    const newCode = passcode.join("");

    if (!newCode) {
      return res.status(400).render("pages/join", {
        title: "Join Membership",
        error: "Passcode is required",
      });
    }

    if (!user) {
      return res.status(404).render("pages/join", {
        title: "Join Membership",
        error: "User not found.",
      });
    }

    const findPasscode = await getPasscode().select(
      "+authentication.salt +authentication.passcode",
    );

    if (!findPasscode || !findPasscode.authentication) {
      return res.status(400).render("pages/join", {
        title: "Join Membership",
        error: "Secret code is not set",
      });
    }

    const expectedHash = authentication(
      findPasscode.authentication.salt,
      newCode,
    );

    if (findPasscode.authentication.passcode !== expectedHash) {
      return res.status(403).render("pages/join", {
        title: "Join Membership",
        error: "Incorrect secret code.",
      });
    }

    user.membership = true;
    await user.save();

    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("pages/join", {
      title: "Join Membership",
      error: "Something went wrong.",
    });
  }
};

export const register = async (req: express.Request, res: express.Response) => {
  const generateProfilePic = () => {
    const colorOne = [
      "lime",
      "green",
      "mediumblue",
      "teal",
      "dimgray",
      "indigo",
      "#001bff",
    ];
    const colorTwo = [
      "violet",
      "red",
      "orange",
      "yellow",
      "purple",
      "fuchsia",
      "pink",
    ];

    const randomIndex = Math.floor(Math.random() * 7);
    const randomIndexTwo = Math.floor(Math.random() * 7);

    const gradientColorOne = `${colorOne[randomIndex]}`;
    const gradientColorTwo = `${colorTwo[randomIndexTwo]}`;
    return `linear-gradient(to left top, ${gradientColorOne}, ${gradientColorTwo})`;
  };
  try {
    const membership = false;
    const profile = generateProfilePic();
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).render("pages/register", {
        title: "Register",
        error: "All required fields must be filled",
      });
    }
    if (username.length < 3) {
      return res.status(400).render("pages/register", {
        title: "Register",
        error: "Username must be atleast 3 characters",
      });
    }

    if (password.length < 6) {
      return res.status(400).render("pages/register", {
        title: "Register",
        error: "Password must be at least 6 characters.",
      });
    }

    const existingUserByEmail = await getUserByEmail(email);
    const existingUserByUsername = await getUserByUsername(username);

    if (existingUserByEmail) {
      return res.status(409).render("pages/register", {
        title: "Register",
        error: "Email already exists",
      });
    }

    if (existingUserByUsername) {
      return res.status(409).render("pages/register", {
        title: "Register",
        error: "Username already exists",
      });
    }

    const salt = random();
    const user = await createUser({
      email,
      username,
      profile,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
      membership,
    });

    const token = generateToken(user);

    res.cookie("cbblog-auth", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("/pages/register", {
      title: "Register",
      error: "Something went wrong",
    });
  }
};

export const testerLogin = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const email = process.env.MB_TEST_EMAIL;
    const password = process.env.MB_TEST_PW;

    if (!email || !password) {
      return res.status(500).render("pages/login", {
        title: "Login",
        error: "Tester login is not configured.",
      });
    }

    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password",
    );

    if (!user || !user.authentication) {
      return res.status(401).render("pages/login", {
        title: "Login",
        error: "Invalid email or password",
      });
    }

    const expectedHash = authentication(user.authentication.salt, password);

    if (user.authentication.password !== expectedHash) {
      return res.status(401).render("pages/login", {
        title: "Login",
        error: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    res.cookie("cbblog-auth", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect("/");
  } catch (error) {
    return res.status(500).render("pages/login", {
      title: "Login",
      error: "Something went wrong.",
    });
  }
};

// export const registerCode = async (
//   req: express.Request,
//   res: express.Response,
// ) => {
//   try {
//     const { passcode } = req.body;
//     if (!passcode) {
//       return res.sendStatus(400);
//     }

//     const salt = random();
//     const secretCode = await createPasscode({
//       authentication: { salt, passcode: authentication(salt, passcode) },
//     });

//     return res.status(200).json(secretCode).end();
//   } catch (error) {
//     return res.sendStatus(400);
//   }
// };

export const logOut = async (req: express.Request, res: express.Response) => {
  try {
    res.clearCookie("cbblog-auth", {
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    return res.redirect("/");
  } catch (error) {
    return res.redirect("/");
  }
};
