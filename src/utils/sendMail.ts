import nodemailer from "nodemailer";

export const SendMail = (email: string, emailToken: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    (async () => {
      const info = await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "Email Verification",
        text: `Please verify your email by clicking the following link: https://localhost:3000/verify-email?token=${emailToken}`,
        html: `<p>Please verify your email by clicking the link below:</p>
       <a href="http://localhost:3000/verify-email?token=${emailToken}">Verify Email</a>`,
      });

      console.log("Message sent:", info.messageId);
    })();
  } catch (error) {
    console.log(error);
  }
};
