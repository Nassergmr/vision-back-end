import nodemailer from "nodemailer";

export const SendMessage = (
  sender: string,
  reciever: string,
  content: string
) => {
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
        to: reciever,
        subject: `Message from ${sender}`,
        text: `${content}`,
        replyTo: sender,
      });

      console.log("Message sent:", info.messageId);
    })();
  } catch (error) {
    console.log(error);
  }
};
