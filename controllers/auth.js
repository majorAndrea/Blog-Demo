const User = require("../models/users.js");
const Post = require("../models/posts.js");
const Comment = require("../models/comments.js");
const Email = require("../mailer/index.js");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const asyncRandomBytes = promisify(randomBytes);
const asyncHandler = require("../utils/async-handler.js");

const RESET_PASSWORD_TOKEN_EXPIRATION_MS = 1_800_000;

class Auth {
  constructor() {
    this.Session = Object.freeze(new Session(this));
    this.UserAuth = Object.freeze(new UserAuth(this));
    this.Privileges = Object.freeze(new Privileges(this));
  }
}

class Session {
  constructor(auth) {
    this.Auth = auth;
  }

  setLoggedUserIntoSession(req, res, { id, username, email, ...otherProps }) {
    req.session.userInfo = {
      id,
      username,
      email,
      ...otherProps,
    };
  }

  deleteUserFromSession(req) {
    req.session.userInfo ? delete req.session.userInfo : null;
  }

  getUserFromSession(req) {
    return req.session.userInfo ? req.session.userInfo : null;
  }

  startTrackUrl = (req, res, next) => {
    if (!req.path.includes("register") && !req.path.includes("login")) {
      if (!!!this.getUserFromSession(req)) {
        req.session.url = req.originalUrl;
      } else {
        req.session.url ? delete req.session.url : null;
      }
    }
    next();
  };

  getTrackUrl(req) {
    return req.session.url ? req.session.url : "/";
  }
}

class UserAuth {
  constructor(auth) {
    this.Auth = auth;
  }

  login({
    successRedirect = undefined,
    successMsg = undefined,
    failureMsg = undefined,
  } = {}) {
    return asyncHandler(async (req, res) => {
      const { email, password } = req.body.user;
      const foundUser = await User.validateCredentials(email, password);
      if (foundUser) {
        this.Auth.Session.setLoggedUserIntoSession(req, res, {
          id: foundUser._id,
          username: foundUser.username,
          email: foundUser.email,
        });
        const success = {
          path: this.Auth.Session.getTrackUrl(req) || successRedirect || "/",
          message: successMsg || "You are now logged In!",
          redirectMsg: "Click here to redirect you back",
        };
        res.location(success.path);
        res.status(200).render("success.ejs", { success });
      } else {
        res
          .status(401)
          .render("users/login.ejs", { failureMsg, tempData: { email } });
      }
    });
  }

  register({ successRedirect = undefined, successMsg = undefined } = {}) {
    return asyncHandler(async (req, res) => {
      const { email, username, password } = req.body.user;
      const newUser = new User({
        username,
        email,
        password,
      });
      await newUser.save();
      this.Auth.Session.setLoggedUserIntoSession(req, res, {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      });
      const success = {
        path: this.Auth.Session.getTrackUrl(req) || successRedirect || "/",
        message:
          successMsg ||
          `Welcome ${username}, you are now successfully registered!`,
        redirectMsg: "Click here to redirect you back.",
      };
      res.location(success.path);
      res.status(201).render("success.ejs", { success });
    });
  }

  logout({ successRedirect, successMsg, failureRedirect } = {}) {
    return (req, res) => {
      if (this.Auth.Session.getUserFromSession(req)) {
        const success = {
          path: successRedirect || "/",
          message:
            successMsg ||
            `See you soon ${
              this.Auth.Session.getUserFromSession(req).username || ""
            }, you are now logged out!`,
          redirectMsg: "Click here to redirect you back.",
        };
        this.Auth.Session.deleteUserFromSession(req);
        res.location(success.path);
        res.status(200).render("success.ejs", { success });
      } else {
        res.redirect(failureRedirect);
      }
    };
  }

  beginPasswordReset({
    successMsg = "If an user exists with this email, then we will send an email with an url to reset the password.",
  } = {}) {
    return asyncHandler(async (req, res) => {
      const { emailOfPasswordToReset } = req.body;
      const userFound = await User.findOne(
        { email: emailOfPasswordToReset },
        { username: 1 }
      );
      if (userFound) {
        asyncRandomBytes(16).then(async (buffer) => {
          const resetPswToken = buffer.toString("hex");
          const tokenExpireDateMs =
            Date.now() + RESET_PASSWORD_TOKEN_EXPIRATION_MS;
          userFound.resetPasswordToken = resetPswToken;
          userFound.resetPasswordTokenExpireDate = tokenExpireDateMs;
          await userFound.save();
          const emailResetPsw = new Email({
            to: emailOfPasswordToReset,
            subject: "Request of password reset - BlogDemo",
          });
          emailResetPsw
            .applyResetPswTemplateToBody({
              generatedToken: resetPswToken,
              tokenExpireMs: RESET_PASSWORD_TOKEN_EXPIRATION_MS,
            })
            .sendEmail();
        });
      }
      res.status(200).render("users/begin-password-reset.ejs", {
        successMsg,
      });
    });
  }

  updateUserPassword({ successRedirect, successMsg } = {}) {
    return asyncHandler(async (req, res) => {
      const { token } = req.query;
      const { password } = req.body.user;
      const userFound = await User.findOne({
        resetPasswordToken: token,
        resetPasswordTokenExpireDate: { $gt: Date.now() },
      });
      if (userFound) {
        userFound.password = password;
        userFound.resetPasswordToken = "";
        userFound.resetPasswordTokenExpireDate = Date.now(); // To expire reset password token.
        await userFound.save();
        const success = {
          path: successRedirect || "/",
          message:
            successMsg ||
            `${userFound.username} you have correctly changed your password. Now you can log in with your new password.`,
          redirectMsg: "Click here to continue.",
        };
        res.location(success.path);
        return res.status(200).render("success.ejs", { success });
      }
      next({
        status: 410,
        message:
          "Your reset password token is invalid or has been expired. If you need to reset your password please try again.",
        redirectInfo: {
          path: "/",
        },
      });
    });
  }
}

class Privileges {
  constructor(auth) {
    this.Auth = auth;
  }

  requireAuthentication({
    failureMsg = undefined,
    failureRedirect = undefined,
  } = {}) {
    return (req, res, next) => {
      if (!this.Auth.Session.getUserFromSession(req)) {
        return next({
          status: 401,
          message: failureMsg,
          redirectInfo: { path: failureRedirect || "/users/login" },
        });
      }
      next();
    };
  }

  isAuthorized(
    sourceToAccess,
    { failureMsg = undefined, failureRedirect = undefined } = {}
  ) {
    return asyncHandler(async (req, res, next) => {
      const { id: userId } = this.Auth.Session.getUserFromSession(req);
      switch (sourceToAccess.toLowerCase()) {
        case "post":
        case "posts":
          const post = await Post.findById(req.params.id);
          if (post.author._id.equals(userId)) {
            return next();
          }
          return next({
            status: 403,
            message: failureMsg,
            redirectInfo: {
              path: failureRedirect || `/posts/${req.params.id}`,
            },
          });
        case "comment":
        case "comments":
          const comment = await Comment.findById(req.params.commentId);
          if (comment.author._id.equals(userId)) {
            return next();
          }
          return next({
            status: 403,
            message: failureMsg,
            redirectInfo: {
              path: failureRedirect || `/posts/${req.params.id}`,
            },
          });
        case "user-actions":
        case "user-action":
          const currentUser =
            this.Auth.Session.getUserFromSession(req).username.toLowerCase();
          const targetUser = req.params.username.toLowerCase();
          if (currentUser === targetUser) {
            return next();
          }
          return next({
            status: 403,
            message: failureMsg || "You are not allowed!",
            redirectInfo: {
              path: failureRedirect || "/",
            },
          });
        //;
      }
    });
  }
}

module.exports = Object.freeze(new Auth());
