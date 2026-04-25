const nodemailer = require("nodemailer");

const sendEmail = async (to, otp, name = "Learner") => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"ScholarHub" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your ScholarHub OTP Code",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:8px;">
          <div style="text-align:center; margin-bottom: 24px; padding: 20px; background-color: #fdf5e6; border-radius: 6px;">
            <h1 style="font-family: 'Georgia', serif; color: #5d4037; margin: 0; font-size: 36px; letter-spacing: 1px;">ScholarHub</h1>
          </div>
          
          <div style="text-align: center;">
            <h2 style="color:#0f172a;">Email Verification</h2>
            <p>Hi ${name},</p>
            <p>Your one-time verification code is:</p>
            <div style="font-size:32px;font-weight:700;letter-spacing:8px;background:#f8fafc;padding:16px 24px;display:inline-block;border-radius:8px;color:#0f172a;border:1px solid #e2e8f0;margin: 10px 0;">
              ${otp}
            </div>
            <p style="margin-top:20px; font-weight: 500;">This OTP expires in 10 minutes.</p>
            <p style="color:#64748b; font-size: 14px; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
              If you did not request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `
    });

    console.log("📧 Email sent:", info.response);
  } catch (error) {
    console.log("❌ Email error:", error.message);
  }
};

module.exports = sendEmail;