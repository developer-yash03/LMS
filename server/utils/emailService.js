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
      from: `"ScholarHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your ScholarHub OTP Code",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:8px;">
          <div style="text-align:center; margin-bottom: 24px; padding: 20px; background-color: #fdf5e6; border-radius: 6px;">
            <h1 style="font-family: 'Georgia', serif; color: #5d4037; margin: 0; font-size: 30px; letter-spacing: 1px;">ScholarHub</h1>
          </div>
          
          <div style="text-align: center;">
            <h2 style="color:#0f172a;">Email Verification</h2>
            <p>Hi ${name},</p>
            <p>Your one-time verification code is:</p>
            <div style="font-size:32px;font-weight:700;letter-spacing:8px;background:#f8fafc;padding:16px 24px;display:inline-block;border-radius:8px;color:#0f172a;border:1px solid #e2e8f0;margin: 10px 0;">
              ${otp}
            </div>
            <p style="margin-top:20px; font-weight: 500;">This OTP expires in 5 minutes.</p>
            <p style="color:#64748b; font-size: 14px; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
              If you did not request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `
    });

    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error.message);
    return false;
  }
};

const sendReceiptEmail = async (email, name, orderDetails) => {
  try {
    const mailer = getTransporter();

    if (!mailer) {
      console.error("Email service is not configured.");
      return false;
    }

    await mailer.sendMail({
      from: `"ScholarHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your ScholarHub Transaction Receipt",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:8px;">
          <div style="text-align:center; margin-bottom: 24px; padding: 20px; background-color: #fdf5e6; border-radius: 6px;">
            <h1 style="font-family: 'Georgia', serif; color: #5d4037; margin: 0; font-size: 30px; letter-spacing: 1px;">ScholarHub</h1>
          </div>
          
          <div>
            <h2 style="color:#0f172a;">Transaction Receipt</h2>
            <p>Hi ${name},</p>
            <p>Thank you for your purchase! Here is the receipt for your transaction.</p>
            
            <table style="width:100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;">
              <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <th style="padding: 12px; text-align: left;">Description</th>
                <th style="padding: 12px; text-align: right;">Amount</th>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${orderDetails.courseName}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">₹${orderDetails.amount}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; text-align: right;">Total Paid</td>
                <td style="padding: 12px; font-weight: bold; text-align: right;">₹${orderDetails.amount}</td>
              </tr>
            </table>

            <p style="color:#64748b; font-size: 14px;">Transaction ID: ${orderDetails.paymentId}</p>
            <p style="color:#64748b; font-size: 14px;">Date: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
      `
    });

    return true;
  } catch (error) {
    console.error("Failed to send receipt email:", error.message);
    return false;
  }
};

module.exports = {
  sendOtpEmail,
  sendReceiptEmail
};
