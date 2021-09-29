const Post = require("../models/posts.js");
const Comment = require("../models/comments.js");
const Auth = require("../services/auth.js");
const asyncHandler = require("../utils/async-handler.js");

module.exports.createComment = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  const { id } = req.params;
  const newComment = new Comment(comment);
  const post = await Post.findById(id);

  post.comments.push(newComment);
  newComment.author = Auth.Session.getUserFromSession(req).id;

  await newComment.save();
  await post.save();

  const success = {
    path: `/posts/${id}`,
    message: "Comment to the Post successfully added!",
    redirectMsg: "Click here to redirect you back to the Post.",
  };

  res.status(201).render("success.ejs", { success });
});

module.exports.deleteComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;

  await Post.findByIdAndUpdate(id, {
    $pull: { comments: commentId },
  });
  await Comment.findByIdAndDelete(commentId);

  const success = {
    path: `/posts/${id}`,
    message: "Comment to the Post successfully removed!",
    redirectMsg: "Click here to redirect you back to the Post.",
  };

  res.status(200).render("success.ejs", { success });
});
