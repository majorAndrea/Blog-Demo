const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Comment = require("./comments");
const formatDate = require("../utils/format-date.js");
// Just for now, after I will create a new model for the categories...
// ...so we can change the categories dynamically without restarting the server.
const postCategories = [
  "science",
  "sport",
  "tech",
  "politics",
  "places",
  "cinema",
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
// This will use the transformation API of cloudinary so,
// is a bit expensive if used extensively.
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
  // I think is a bit overkill to get all Posts only to find all the Posts
  // related to a single user. Using some relation between the Posts Model and the
  // User Model of the author of the Post is a better solution,
  // but for this personal project WebApp I think is Ok.
  const postsFounded = (
    await this.find().populate({
      path: "author",
      select: "username",
    })
  )
    //Get only the posts created by the specific user.
    .filter((post) => post.author.username === username)
    //Retrive only the important data.
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
    for (comment of doc.comments) {
      await Comment.findByIdAndDelete(comment._id);
    }
  }
});

module.exports = mongoose.model("Post", postSchema);
