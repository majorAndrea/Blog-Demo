const express = require("express");
const router = express.Router();
const {
  validateUser,
  validateUserUpdate,
} = require("../utils/val-middleware.js");
const users = require("../controllers/users.js");
const Auth = require("../controllers/auth.js");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router.get("/login", users.renderLogin);

router.get("/begin_password_reset", users.renderBeginPasswordReset);

router.get("/:username/password_reset/token/:token", users.renderPasswordReset);

// --- USER DASHBOARD -------------------------
router.get(
  "/:username/dashboard",
  Auth.Privileges.requireAuthentication({
    failureMsg: "You are not logged in!",
    failureRedirect: "/users/login",
  }),
  Auth.Privileges.isAuthorized("user-actions", {
    failureMsg: "You are not allowed to see this page.",
  }),
  users.renderDashboard
);

router.get("/register", users.renderRegister);

// --- USER PUBLIC PROFILE --------------------
router.get(
  "/:username",
  Auth.Privileges.requireAuthentication({
    failureMsg: "You are not logged in!",
    failureRedirect: "/users/login",
  }),
  users.renderProfile
);

// ---------------------------------------------

router.post("/login", users.loginUser);

router.post("/logout", users.logoutUser);

router.post("/begin_password_reset", users.beginPasswordReset);

router.post("/register", validateUser, users.registerUser);

// --- USER UPDATE PROFILE ---------------------
router.patch(
  "/:username",
  Auth.Privileges.requireAuthentication({
    failureMsg: "You are not logged in!",
    failureRedirect: "/users/login",
  }),
  Auth.Privileges.isAuthorized("user-actions", {
    failureMsg: "You are not allowed to do that.",
  }),
  upload.single("user[image]"),
  validateUserUpdate,
  users.updateUser
);

router.patch("/:username/reset_password", users.updateUserPassword);

module.exports = router;
