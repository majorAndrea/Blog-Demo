const { postValidationSchema } = require("../joi/posts.js");
const commentValidationSchema = require("../joi/comments.js");
const {
  userValidationSchema,
  userUpdateValidationSchema,
} = require("../joi/users.js");
const User = require("../models/users.js");
const { cloudinary } = require("../cloudinary");

// Check if any error returned from one of the function validators below.
const checkErrors = async (
  anyError,
  next,
  { status = 500, path = "/", data = null },
  file = undefined
) => {
  if (!anyError) {
    return next();
  } else {
    if (file) await cloudinary.uploader.destroy(file.filename);

    const errMsg = anyError.details.map((msg) => msg.message).join(", ");
    return next({
      status: status,
      message: errMsg,
      redirectInfo: { path, data },
    });
  }
};

const validatePost = (req, res, next) => {
  const { post } = req.body;
  let { error } = postValidationSchema.validate(post);

  // Validation for new posts with an invalid image.
  if (!req.file && req.method !== "PUT") {
    // If there is already an error, push this too.
    if (error) {
      error.details.push({
        message:
          "The image format you have uploaded is not supported, please upload only supported formats.",
      });
    } else {
      // If no error, then create the entire error object.
      error = {
        details: [
          {
            message:
              "The image format you have uploaded is not supported, please upload only supported formats.",
          },
        ],
      };
    }
  }
  checkErrors(
    error,
    next,
    {
      path: `${req.method === "POST" ? "posts/new" : `${req.params.id}/edit`}`,
      status: 422,
      data: (() => {
        if (req.method === "POST") {
          // Return the post data only for POST requests.
          return post;
        }
        return null;
      })(),
    },
    // Pass reference of the image to be deleted from cloudinary if the post contains invalid data.
    req.file
  );
};

const validateComment = (req, res, next) => {
  const { comment } = req.body;
  const { error } = commentValidationSchema.validate(comment);

  checkErrors(error, next, {
    path: `/posts/${req.params.id}`,
    status: 422,
    data: comment,
  });
};

const validateUser = async (req, res, next) => {
  const { user } = req.body;
  const { error } = userValidationSchema.validate(user);
  const anyDuplicateError = await findDuplicates(user.email, user.username);

  checkErrors(error || anyDuplicateError, next, {
    path: "/users/register",
    status: error ? 422 : 409,
    data: user,
  });
};

const validateUserUpdate = async (req, res, next) => {
  // Skip validation if user change only the profile image.
  if (req.file) return next();

  const { user } = req.body;
  const { error } = userUpdateValidationSchema.validate(user);
  let anyDuplicateError = undefined;

  // Only check for username duplicates if the user tries to change it from the dashboard.
  if (user.username)
    anyDuplicateError = await findDuplicates(undefined, user.username);

  checkErrors(error || anyDuplicateError, next, {
    path: `/users/${req.params.username}/dashboard`,
    status: error ? 422 : 409,
    data: null,
  });
};

// Find any duplicate with the User mongoose schema static method.
const findDuplicates = async (email = undefined, username = undefined) => {
  if (email) {
    const duplicateEmail = await User.findDuplicates("email", email);

    if (duplicateEmail) {
      return {
        details: [
          {
            message: "This email already exists, please log in!",
          },
        ],
      };
    }
  }
  if (username) {
    const duplicateUsername = await User.findDuplicates("username", username);

    if (duplicateUsername) {
      return {
        details: [
          {
            message:
              "This username has already been taken, please choose another one!",
          },
        ],
      };
    }
  }
  return undefined;
};

module.exports = {
  validatePost,
  validateComment,
  validateUser,
  validateUserUpdate,
};
