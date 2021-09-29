const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const formatDate = require("../utils/format-date.js");
const commentSchema = new Schema(
  {
    text: String,
    author: {
      _id: false,
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Get formatted date for the post.
commentSchema.methods.retriveDate = function () {
  return formatDate(this, "createdAt");
};

// Get all comments related to an user.
commentSchema.statics.getAllCommentsOfUser = async function (username) {
  const commentsFounded = (await this.find().populate("author"))
    .filter((comment) => comment.author.username === username)
    .map((comment) => ({
      _id: comment._id,
      text: comment.text,
      createdAt: formatDate(comment, "createdAt"),
    }));
  return commentsFounded;
};

module.exports = mongoose.model("Comment", commentSchema);
