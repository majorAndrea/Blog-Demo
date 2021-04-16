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

module.exports = mongoose.model("Comment", commentSchema);
