import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  passwordSalt: process.env.passwordSalt,
  Cloudinary: {
    API_KEY: process.env.Cloudinary_API_KEY,
    API_SECRET: process.env.Cloudinary_API_SECRET,
  },
  ACCESS_TOKEN: process.env.JWT_ACCESS_TOKEN as string,
};
