import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend root so this config works even when imported directly.
dotenv.config({ path: path.join(__dirname, "../../.env") });

const SMTP_HOST = process.env.SMTP_HOST?.trim();
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = process.env.SMTP_SECURE === "true" || SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER?.trim();
const SMTP_PASS = process.env.SMTP_PASS?.trim();
const SMTP_LOGIN = process.env.SMTP_LOGIN?.trim() || SMTP_USER || "";


const transporter = SMTP_HOST
	? nodemailer.createTransport({
		host: SMTP_HOST,
		port: SMTP_PORT,
		secure: SMTP_SECURE,

		auth: {
			user: SMTP_LOGIN,
			pass: SMTP_PASS,
		},
	})
	: nodemailer.createTransport({ jsonTransport: true });

export default transporter;
