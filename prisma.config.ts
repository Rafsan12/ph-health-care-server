import { defineConfig } from "@prisma/config";
import { config } from "dotenv";

config();
export default defineConfig({
  schema: "prisma/schema",
  // If you use multiple schemas or generators, you can specify them here too
});
