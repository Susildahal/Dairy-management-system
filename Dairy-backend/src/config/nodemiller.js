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
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL?.trim() || SMTP_USER || "";
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME?.trim() || process.env.APP_NAME?.trim() || "Dairy App";

const hasSmtpConfig = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_FROM_EMAIL);

const transporter = hasSmtpConfig
	? nodemailer.createTransport({
			host: SMTP_HOST,
			port: SMTP_PORT,
			secure: SMTP_SECURE,
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASS,
			},
		})
	: nodemailer.createTransport({ jsonTransport: true });

const verifySmtpConnection = async () => {
	if (!hasSmtpConfig) {
		console.warn(
			"⚠️ SMTP configuration is incomplete. Email delivery is using a JSON fallback until SMTP_* variables are set."
		);
		return false;
	}

	try {
		await transporter.verify();
		console.log("✅ SMTP connection verified successfully.");
		return true;
	} catch (error) {
		console.error("❌ SMTP verification failed:", error?.message ?? error);
		return false;
	}
};

export { SMTP_FROM_EMAIL, SMTP_FROM_NAME, verifySmtpConnection };
export default transporter;
