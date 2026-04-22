const nodemailer = require("nodemailer");

const sendEmail = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"LMS App" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`
    });

    console.log("📧 Email sent:", info.response);
  } catch (error) {
    console.log("❌ Email error:", error.message);
  }
};

module.exports = sendEmail;