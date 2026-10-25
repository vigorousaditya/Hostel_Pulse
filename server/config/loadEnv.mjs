import dns from "dns";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Force IPv4 DNS resolution across the whole application (solves Brevo SMTP & Atlas SRV timeouts on cloud hosts)
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Try loading server/.env first, then default process.cwd()/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();
