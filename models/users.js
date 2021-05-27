const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcryptjs = require("bcryptjs");
const formatDate = require("../utils/format-date.js");

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "Username cannot be blank!"],
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
  },
  image: {
    path: {
      type: String,
      default:
        "https://res.cloudinary.com/dnymebtck/image/upload/v1616164071/BlogDemo/default-profile-2_z8lutx.png",
    },
    filename: { type: String },
  },
  bio: {
    type: String,
  },
  birthday: {
    type: Date,
  },
  password: {
    type: String,
    required: [true, "Password cannot be blank!"],
  },
  profileVisits: {
    type: Number,
    default: 0,
  },
});

userSchema.statics.validateCredentials = async function (email, password) {
  const foundUser = await this.findOne(
    { email },
    { email: 1, username: 1, password: 1 }
  );
  if (!foundUser) return undefined;
  const isMatch = await bcryptjs.compare(password, foundUser.password);
  return isMatch ? foundUser : undefined;
};

userSchema.statics.findDuplicates = async function (type, data) {
  const result = await this.findOne({ [type]: data });
  if (result) return true;
  return false;
};

userSchema.methods.retriveDate = function () {
  return formatDate(this, "birthday");
};

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcryptjs.hash(this.password, 12);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
