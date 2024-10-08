const multer = require("multer");
const path = require("path");
const { slugify } = require("transliteration");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    console.log("REQ", file);
    const ext = path.extname(file.originalname);
    const originalName = slugify(path.basename(file.originalname, ext));
    console.log("ORIGINALNAME", originalName);
    cb(null, `${Date.now()}-${file.fieldname}-${originalName}${ext}`);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
