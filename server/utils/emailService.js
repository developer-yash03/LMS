const nodemailer = require("nodemailer");

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn("⚠️  Email credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env file.");
    return null;
  }

  const emailConfig = {
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  };

  return nodemailer.createTransport(emailConfig);
};

const sendOtpEmail = async (email, otp, name) => {
  try {
    const transporter = getTransporter();

    if (!transporter) {
      console.log("📧 Email service not configured. OTP for testing:", otp);
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@lms.com",
      to: email,
      subject: "Your OTP for Email Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Hi ${name},</p>
          <p>Thank you for signing up! Your One-Time Password (OTP) for email verification is:</p>
          <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; letter-spacing: 3px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666;">This OTP will expire in 10 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you did not sign up for this account, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error.message);
    throw new Error("Failed to send OTP email");
  }
};

module.exports = { sendOtpEmail };
