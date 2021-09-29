const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const mimeTypesWhiteList = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

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
