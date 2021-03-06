const Auth = require("../services/auth.js");
const User = require("../models/users.js");
const Post = require("../models/posts.js");
const Comment = require("../models/comments.js");
const asyncHandler = require("../utils/async-handler.js");

module.exports.renderLogin = (req, res) => {
  if (Auth.Session.getUserFromSession(req)) return res.redirect("/");

  res.render("users/login.ejs", {
    csrfToken: req.csrfToken(),
    failureMsg: undefined,
  });
};

module.exports.renderRegister = (req, res) => {
  if (Auth.Session.getUserFromSession(req)) return res.redirect("/");

  res.render("users/register.ejs", {
    csrfToken: req.csrfToken(),
    failureMsg: undefined,
  });
};

module.exports.renderBeginPasswordReset = (req, res) => {
  if (Auth.Session.getUserFromSession(req)) return res.redirect("/");

  res.render("users/begin-password-reset.ejs", {
    csrfToken: req.csrfToken(),
    successMsg: undefined,
  });
};

module.exports.renderPasswordReset = asyncHandler(async (req, res, next) => {
  const { username } = req.params;
  const { token } = req.query;

  const userFound = await User.findOne({
    resetPasswordToken: token,
    resetPasswordTokenExpireDate: { $gt: Date.now() },
  });
  if (userFound) {
    return res.render("users/password-reset.ejs", {
      csrfToken: req.csrfToken(),
      token,
      username,
    });
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

module.exports.beginPasswordReset = Auth.UserAuth.beginPasswordReset();

module.exports.updateUserPassword = Auth.UserAuth.updateUserPassword();

module.exports.renderDashboard = asyncHandler(async (req, res) => {
  const currentUser = Auth.Session.getUserFromSession(req);
  const userInfo = await User.findOne(
    { email: currentUser.email },
    { bio: 1, birthday: 1, image: 1, profileVisits: 1 }
  );
  const userPosts = await Post.getAllPostsOfUser(req.params.username);
  const userComments = await Comment.getAllCommentsOfUser(req.params.username);

  res.render("users/dashboard/index.ejs", {
    csrfToken: req.csrfToken(),
    userImage: (userInfo.image && userInfo.image.path) || undefined,
    userBio: userInfo.bio || undefined,
    userBirthday: userInfo.retriveDate(),
    userPosts: userPosts || undefined,
    userComments: userComments || undefined,
    failureMsg: undefined,
    profileVisits: userInfo.profileVisits,
  });
});

module.exports.renderProfile = asyncHandler(async (req, res) => {
  const currentUser = Auth.Session.getUserFromSession(req);
  const userInfo = await User.findOne(
    { username: req.params.username },
    { username: 1, bio: 1, birthday: 1, image: 1, profileVisits: 1 }
  );

  if (currentUser.username !== req.params.username) {
    if (userInfo.profileVisits) {
      userInfo.set("profileVisits", parseInt(userInfo.profileVisits) + 1);
    } else {
      userInfo.set("profileVisits", 1);
    }
    await userInfo.save();
  }
  res.render("users/profile.ejs", {
    username: userInfo.username,
    userImage: (userInfo.image && userInfo.image.path) || undefined,
    userBio: userInfo.bio || undefined,
    userBirthday: userInfo.retriveDate(),
    failureMsg: undefined,
  });
});

module.exports.registerUser = Auth.UserAuth.register({});

module.exports.loginUser = Auth.UserAuth.login({
  failureMsg: "Invalid credentials!",
});

module.exports.logoutUser = Auth.UserAuth.logout({
  successRedirect: "/",
  failureRedirect: "/",
});

module.exports.updateUser = asyncHandler(async (req, res) => {
  // If user try to change the profile image, then append the object to the body to be
  // compatible with the mongoose findOneAndUpdate function.
  if (req.file) {
    req.body.user = { image: req.file };
  }

  const username = req.params.username;
  await User.findOneAndUpdate(
    { username: username },
    { ...req.body.user },
    { upsert: true }
  );

  // If the user changes its username, then logout the user.
  if (!req.body.user.username) {
    const success = {
      path: `/users/${req.params.username}/dashboard`,
      message: "Profile successfully updated!",
      redirectMsg: "Click here to redirect you back.",
    };
    res.status(200).render("success.ejs", { success });
  } else {
    return Auth.UserAuth.logout({
      successMsg:
        "Because you have changed your username, you must log in again.",
      successRedirect: "/users/login",
    })(req, res);
  }
});
