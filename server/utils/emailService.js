const nodemailer = require("nodemailer");

let transporter;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPassword = String(process.env.EMAIL_PASSWORD || "").replace(/\s+/g, "");

  if (!emailUser || !emailPassword) {
    return null;
  }

  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: emailUser,
      pass: emailPassword
    }
  });

  return transporter;
};

const sendOtpEmail = async (email, otp, name = "Learner") => {
  try {
    const mailer = getTransporter();

    if (!mailer) {
      console.error("Email service is not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env");
      return false;
    }

    await mailer.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your LMS OTP Code",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:8px;">
          <h2 style="color:#0f172a;">Email Verification</h2>
          <p>Hi ${name},</p>
          <p>Your one-time verification code is:</p>
          <div style="font-size:28px;font-weight:700;letter-spacing:6px;background:#f8fafc;padding:12px 16px;display:inline-block;border-radius:6px;color:#0f172a;">
            ${otp}
          </div>
          <p style="margin-top:16px;">This OTP expires in 10 minutes.</p>
          <p style="color:#475569;">If you did not request this, you can ignore this email.</p>
        </div>
      `
    });

    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error.message);
    return false;
  }
};

module.exports = {
  sendOtpEmail
};
