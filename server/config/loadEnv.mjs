import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Try loading server/.env first, then default process.cwd()/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();
