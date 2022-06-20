const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images/profilePictures");
  },
  filename: (req, file, callback) => {
    let name = file.originalname.normalize().replace(/.[^/.]+$/, "");
    name = name.split(" ").join("_").toLowerCase();
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + "_" + Date.now() + "." + extension);
  },
});

const uploadProfilePicture = multer({
  storage,
  limits: {
    fieldNameSize: 50,
    fileSize: 500000,
  },
  fileFilter: (req, file, callback) => {
    if (!MIME_TYPES[file.mimetype]) {
      callback(new Error("Le type d'image doit être un jpg, jpeg, ou png !"));
    } else {
      callback(null, true);
    }
  },
}).single("profilePicture");

module.exports = {
  uploadProfilePicture,
};
