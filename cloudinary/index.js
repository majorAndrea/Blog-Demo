const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const mimeTypesWhiteList = ["image/png", "image/jpeg", "/image/jpg"];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// This function will make the Post validation fail because if the format of the image
// is not allowed, then this function will abort the uploading process of the image
// then inside the validatePost the request object will not have any image so
// it will fire raise the validation error.
const fileFilter = (req, file, cb) => {
  if (mimeTypesWhiteList.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "BlogDemo",
  },
});

module.exports = { cloudinary, storage, fileFilter };
