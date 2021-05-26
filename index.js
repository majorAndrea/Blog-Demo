if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const PORT = 3000;
const DB_CONNECTION = process.env.DB_CONNECTION;
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");
const ejsMate = require("ejs-mate");
const postsRoutes = require("./routes/posts.js");
const commentsRoutes = require("./routes/comments.js");
const authRoutes = require("./routes/users.js");
const methodOverride = require("method-override");
const AppError = require("./utils/app-error.js");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoStore = new MongoStore({
  url: process.env.DB_CONNECTION,
  secret: "changemeplease",
  touchAfter: 24 * 60 * 60,
});
const sessionConfig = {
  store: mongoStore,
  name: "live",
  secret: "changemeplease",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Milliseconds, seconds, minutes, hours, daysInWeek.
    magAge: Date.now() + 1000 * 60 * 60 * 24 * 7,
  },
};
// const helmet = require("helmet");
const Auth = require("./controllers/auth.js");
const Post = require("./models/posts.js");
const csrf = require("csurf");
const csrfProtection = csrf();
const contentSecurityPolicy = require("./utils/content-security-policy.js");

// MONGO-DB SETUP --------------------------> mongodb://localhost:27017/blogDB

mongoose
  .connect(DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("=> MONGODB connection OPEN!");
  })
  .catch((e) => {
    console.log("=> MONGODB connection FAILED!");
    console.log(e);
  });

// APP SETTINGS ---------------------------->

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(methodOverride("_method"));
app.use(session(sessionConfig));
app.use(csrfProtection);
app.use(contentSecurityPolicy());
app.use(Auth.Session.startTrackUrl);

// Setting some things in this middleware.
app.use((req, res, next) => {
  res.locals.signedUser = Auth.Session.getUserFromSession(req);
  res.locals.urlPath = req.path || "/";
  res.locals.csrfToken = req.csrfToken();
  // If there is any data after redirect, this will set that data in the locals object for the views.
  res.locals.tempData = req.session.tempData || null;
  // Delete from the session object the temp data used for the redirect with data.
  req.session.tempData && delete req.session.tempData;
  console.log(req.path);
  next();
});

// ROUTES ---------------------------------->
app.get(["/", "/home"], async (req, res) => {
  const postsCarousel = await Post.find({}).limit(3).sort("-createdAt");
  const postsMini = await Post.find({}).limit(3).sort("createdAt");
  res.render("index.ejs", { postsCarousel, postsMini });
});
app.use("/users", authRoutes);
app.use("/posts", postsRoutes);
app.use("/posts/:id/comments", commentsRoutes);

// ERRORS HANDLING ------------------------->

app.all("*", (req, res, next) => {
  next({ status: 404, message: "Content not Found!" });
});

app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.redirect("/");
  }
  throw new AppError(err).redirect(req, res);
});

// ------------------------------------------

app.listen(PORT, () => {
  console.log(`=> Server UP and running! (PORT ${PORT})`);
});
