// module.exports = Object.freeze({
//   // This will set the URL before the user register to the blog or log in to the blog,
//   // so when the user login or register to the blog will be redirect to the original URL.
//   sessionUrl: {
//     set: (req) => {
//       // Keep track of all URLs except the login or register page.
//       if (!req.path.includes("register") && !req.path.includes("login")) {
//         req.session.url = req.originalUrl;
//       }
//     },
//     get: (req) => {
//       // If no URL stored, safely get back the home page path in case someone call this get method.
//       if (!req.session.url) {
//         return "/";
//       }
//       return req.session.url;
//     },
//   },
//   sessionUser: {
//     set: (req, res, { id, username, email, ...otherProps }) => {
//       req.session.userInfo = {
//         id,
//         username,
//         email,
//         ...otherProps,
//       };
//       res.locals.signedUser = req.session.userInfo;
//     },
//     get: (req) => {
//       return req.session.userInfo ? req.session.userInfo : null;
//     },
//   },
//   initialize: function () {
//     return (req, res, next) => {
//       if (!this.isAuthenticated(req)) {
//         this.sessionUrl.set(req);
//       } else if (this.isAuthenticated(req) && req.session.url) {
//         delete req.session.url;
//       }
//       req.session.userInfo = this.sessionUser.get(req);
//       res.locals.signedUser = this.sessionUser.get(req);
//       next();
//     };
//   },
//   login: function ({
//     successRedirect = undefined,
//     successMsg = undefined,
//     failureMsg = undefined,
//   } = {}) {
//     return asyncHandler(async (req, res) => {
//       const { email, password } = req.body.user;
//       const foundUser = await User.validateCredentials(email, password);
//       if (foundUser) {
//         this.sessionUser.set(req, res, {
//           id: foundUser._id,
//           username: foundUser.username,
//           email: foundUser.email,
//         });
//         const success = {
//           path: this.sessionUrl.get(req) || successRedirect || "/",
//           message: successMsg || "You are now logged In!",
//           redirectMsg: "Click here to redirect you back",
//         };
//         res.status(200).render("success.ejs", { success });
//       } else {
//         res
//           .status(401)
//           .render("users/login.ejs", { failureMsg, tempData: { email } });
//       }
//     });
//   },
//   register: function ({
//     successRedirect = undefined,
//     successMsg = undefined,
//   } = {}) {
//     return asyncHandler(async (req, res) => {
//       const { email, username, password } = req.body.user;
//       const newUser = new User({
//         username,
//         email,
//         password,
//         image: {
//           path:
//             "https://res.cloudinary.com/dnymebtck/image/upload/v1616164071/BlogDemo/default-profile-2_z8lutx.png", // Default profile image.
//         },
//       });
//       await newUser.save();
//       this.sessionUser.set(req, res, {
//         id: foundUser._id,
//         username: foundUser.username,
//         email: foundUser.email,
//       });
//       const success = {
//         path: this.sessionUrl.get(req) || successRedirect || "/",
//         message:
//           successMsg ||
//           `Welcome ${username}, you are now successfully registered!`,
//         redirectMsg: "Click here to redirect you back.",
//       };
//       res.status(201).render("success.ejs", { success });
//     });
//   },
//   logout: function ({
//     successRedirect = undefined,
//     successMsg = undefined,
//     failureRedirect = undefined,
//   } = {}) {
//     return (req, res) => {
//       if (this.isAuthenticated(req)) {
//         const success = {
//           path: successRedirect || "/",
//           message:
//             successMsg ||
//             `See you soon ${
//               res.locals.signedUser.username || ""
//             }, you are now logged out!`,
//           redirectMsg: "Click here to redirect you back.",
//         };
//         req.session.userInfo = null;
//         res.locals.signedUser = null;
//         res.status(200).render("success.ejs", { success });
//       } else {
//         res.redirect(failureRedirect);
//       }
//     };
//   },
//   isAuthenticated: function (req) {
//     return this.sessionUser.get(req);
//   },
//   requireAuthentication: function ({
//     failureMsg = undefined,
//     failureRedirect = undefined,
//   } = {}) {
//     return (req, res, next) => {
//       if (!this.isAuthenticated(req)) {
//         return next({
//           status: 401,
//           message: failureMsg,
//           redirectInfo: { path: failureRedirect || "/users/login" },
//         });
//       }
//       next();
//     };
//   },
//   isAuthorized: function (
//     sourceToAccess,
//     { failureMsg = undefined, failureRedirect = undefined } = {}
//   ) {
//     return asyncHandler(async (req, res, next) => {
//       const { id: userId } = this.isAuthenticated(req);
//       switch (sourceToAccess.toLowerCase()) {
//         case "post":
//         case "posts":
//           const post = await Post.findById(req.params.id);
//           if (post.author._id.equals(userId)) {
//             return next();
//           }
//           return next({
//             status: 403,
//             message: failureMsg,
//             redirectInfo: {
//               path: failureRedirect || `/posts/${req.params.id}`,
//             },
//           });
//         case "comment":
//         case "comments":
//           const comment = await Comment.findById(req.params.commentId);
//           if (comment.author._id.equals(userId)) {
//             return next();
//           }
//           return next({
//             status: 403,
//             message: failureMsg,
//             redirectInfo: {
//               path: failureRedirect || `/posts/${req.params.id}`,
//             },
//           });
//         case "user-actions":
//         case "user-action":
//           const currentUser = this.isAuthenticated(req).username.toLowerCase();
//           const targetUser = req.params.username.toLowerCase();
//           if (currentUser === targetUser) {
//             return next();
//           }
//           return next({
//             status: 403,
//             message: failureMsg || "You are not allowed!",
//             redirectInfo: {
//               path: failureRedirect || "/",
//             },
//           });
//       }
//     });
//   },
// });
