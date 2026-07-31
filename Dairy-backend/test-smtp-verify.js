import transporter, { verifySmtpConnection, sendTestEmail } from "./src/config/nodemiller.js";

console.log("Testing SMTP connection...");

try {
  const success = await transporter.verify();
  console.log("✅ Connection Successful!", success);
  
  console.log("Sending test email...");
  const info = await sendTestEmail();
  console.log("✅ Email sent successfully:", info.messageId);
} catch (error) {
  console.error("❌ SMTP Verification Failed:");
  console.error("Error Message:", error.message);
  if (error.response) console.error("SMTP Server Response:", error.response);
}
