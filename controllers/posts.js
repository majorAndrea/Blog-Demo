const Post = require("../models/posts.js");
const asyncHandler = require("../utils/async-handler.js");
const Auth = require("./auth.js");
const { cloudinary } = require("../cloudinary/");

// ------- C.R.U.D -------------->

module.exports.createPost = asyncHandler(async (req, res) => {
  // CREATE
  const newPost = new Post(req.body.post);
  newPost.author = Auth.Session.getUserFromSession(req).id;
  newPost.image = req.file;
  await newPost.save();
  const success = {
    path: `/posts/${newPost._id}`,
    message: "Post successfully created!",
    redirectMsg: "Click here to redirect you to see the Post.",
  };
  res.status(201).render("success.ejs", { success });
});

module.exports.readPost = asyncHandler(async (req, res) => {
  // READ
  const post = await Post.findById(req.params.id)
    .populate({
      path: "comments",
      populate: {
        path: "author",
        select: "username",
      },
    })
    .populate("author");
  if (!post) {
    return res.redirect("/posts");
  }
  res.render("posts/show.ejs", { post, csrfToken: req.csrfToken() });
});

module.exports.updatePost = asyncHandler(async (req, res) => {
  // UPDATE
  const { id } = req.params;
  const { post } = req.body;
  await Post.findByIdAndUpdate(id, post);
  const success = {
    path: `/posts/${id}`,
    message: "Post successfully updated!",
    redirectMsg: "Click here to redirect you to the Post.",
  };
  res.status(200).render("success.ejs", { success });
});

module.exports.updatePostImage = asyncHandler(async (req, res) => {
  // UPDATE
  const { id } = req.params;
  const success = {
    path: `/posts/${id}`,
    redirectMsg: "Click here to redirect you to the Post.",
  };
  if (req.file) {
    const updatedPost = await Post.findById(id);
    await cloudinary.uploader.destroy(updatedPost.image.filename);
    updatedPost.image = req.file;
    await updatedPost.save();
    success.message = "Image of the Post successfully updated.";
    res.status(200).render("success.ejs", { success });
  } else {
    success.message = "Image of the Post is the same, no changes made.";
    res.status(200).render("success.ejs", { success });
  }
});

module.exports.deletePost = asyncHandler(async (req, res) => {
  // DELETE
  const { id } = req.params;
  const deletedPost = await Post.findByIdAndDelete(id);
  await cloudinary.uploader.destroy(deletedPost.image.filename);
  const success = {
    path: `/posts`,
    message: "Post successfully deleted!",
    redirectMsg: "Click here to redirect you to back.",
  };
  res.status(200).render("success.ejs", { success });
});

// ------- RENDER ------------------->

module.exports.renderIndexPosts = asyncHandler(async (req, res) => {
  const { category } = req.query;
  let posts;
  if (category) posts = await Post.find({ categories: category });
  else posts = await Post.find({});
  res.render("posts/index.ejs", {
    posts,
    category,
    csrfToken: req.csrfToken(),
  });
});

module.exports.renderCreatePost = (req, res) => {
  const postCategories = Post.getCategories();
  res.render("posts/new.ejs", { postCategories, csrfToken: req.csrfToken() });
};

module.exports.renderUpdatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  const postCategories = Post.getCategories();
  res.render("posts/edit.ejs", {
    post,
    postCategories,
    csrfToken: req.csrfToken(),
  });
});

module.exports.renderUpdatePostImage = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id, { image: 1 });
  res.render("posts/edit-image.ejs", { post, csrfToken: req.csrfToken() });
});
