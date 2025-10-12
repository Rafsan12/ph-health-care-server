import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";
import config from "../../config";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

export const upload = multer({ storage: storage });

export const uploadToCloudinary = async (file: Express.Multer.File) => {
  // console.log(file);
  // Configuration
  cloudinary.config({
    cloud_name: "due57r8ws",
    api_key: config.Cloudinary.API_KEY,
    api_secret: config.Cloudinary.API_SECRET,
  });

  const uploadResult = await cloudinary.uploader
    .upload(file.path, {
      public_id: file.filename,
    })
    .catch((error) => {
      console.log(error);
    });
  return uploadResult;
  // console.log(uploadResult);
};
