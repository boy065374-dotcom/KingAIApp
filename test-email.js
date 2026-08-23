require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_APP_PASSWORD
  }
});

async function testEmail() {
  try {
    await transporter.verify();

    console.log("✅ Gmail SMTP شغال!");

    await transporter.sendMail({
      from: `"KingGPT" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: "KingGPT SMTP Test",
      text: "نجح اختبار إرسال البريد من KingGPT 👑"
    });

    console.log("📧 تم إرسال رسالة الاختبار!");
  } catch (error) {
    console.error("❌ SMTP Error:");
    console.error(error.message);
  }
}

testEmail();
