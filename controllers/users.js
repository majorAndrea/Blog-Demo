const Auth = require("./auth.js");
const User = require("../models/users.js");
const Post = require("../models/posts.js");
const Comment = require("../models/comments.js");
const asyncHandler = require("../utils/async-handler.js");

module.exports.renderLogin = (req, res) => {
  res.render("users/login.ejs", {
    csrfToken: req.csrfToken(),
    failureMsg: undefined,
  });
};

module.exports.renderRegister = (req, res) => {
  res.render("users/register.ejs", {
    csrfToken: req.csrfToken(),
    failureMsg: undefined,
  });
};

module.exports.renderDashboard = asyncHandler(async (req, res) => {
  const userInfo = await User.findOne(
    { email: Auth.Session.getUserFromSession(req).email },
    { bio: 1, birthday: 1, image: 1 }
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
  });
});

module.exports.renderProfile = asyncHandler(async (req, res) => {
  const userInfo = await User.findOne(
    { username: req.params.username },
    { username: 1, bio: 1, birthday: 1, image: 1 }
  );
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
  // If the user changes his username, then logout the user.
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
