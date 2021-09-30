const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Comment = require("./comments");
const formatDate = require("../utils/format-date.js");
const postCategories = [
  "science",
  "sport",
  "tech",
  "politics",
  "places",
];

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    image: {
      path: { type: String, required: true },
      filename: { type: String, required: true },
    },
    text: { type: String, required: true },
    author: {
      _id: false,
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: [
      {
        _id: false,
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    categories: {
      type: [String],
      enum: postCategories,
      required: true,
    },
    location: {
      placename: {
        type: String,
      },
      geometry: {
        type: {
          type: String,
          enum: ["Point"],
        },
        coordinates: {
          type: [Number],
        },
      },
    },
  },
  { timestamps: true }
);

// Get the post image with some specified width.
// This will use the transformation API of cloudinary.
// Expensive method.
postSchema.methods.resizeImage = function (width, height = null) {
  const imgPath = this.image.path;
  width = width.toString();
  if (height && width) {
    return imgPath.replace("upload/", `upload/w_${width},h_${height}/`);
  }
  return imgPath.replace("upload/", `upload/w_${width}/`);
};

// Used to check if the Post should display the Map in the show page.
postSchema.methods.hasLocation = function () {
  return (
    this.location.geometry.coordinates.length > 0 &&
    this.categories.includes("places")
  );
};

// Get formatted date for the post.
postSchema.methods.retriveDate = function () {
  return formatDate(this, "createdAt");
};

// To populate edit and new Post forms with all the avaiable categories.
postSchema.statics.getCategories = () => {
  return postCategories;
};

// Search and return all Posts created by a specific user.
postSchema.statics.getAllPostsOfUser = async function (username) {
  const postsFounded = (
    await this.find().populate({
      path: "author",
      select: "username",
    })
  )
    .filter((post) => post.author.username === username)
    .map((post) => ({
      _id: post._id,
      title: post.title,
      image: post.image.path,
      text: post.text,
    }));
  return postsFounded;
};

// When deleting one Post also delete all the comments for that post.
postSchema.post("findOneAndDelete", async function (doc) {
  if (doc.comments) {
    for (let comment of doc.comments) {
      await Comment.findByIdAndDelete(comment._id);
    }
  }
});

module.exports = mongoose.model("Post", postSchema);
