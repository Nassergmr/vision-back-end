import nodemailer from "nodemailer";

export const SendResetMail = (email: string, token: string) => {
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
        from: `"Vision" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Reset password",
        text: `You requested to reset your password. Please click the following link to set a new password: http://localhost:3000/reset-password/new-password?token=${token}`,
        html: `<p>You requested to reset your password.</p>
       <p>Please click the link below to set a new password:</p>
       <a href="http://localhost:3000/reset-password/new-password?token=${token}">Reset my password</a>`,
      });
    })();
  } catch (error) {
    alert(error);
  }
};
