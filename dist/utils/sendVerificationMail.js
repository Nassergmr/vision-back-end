"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendVerificationMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const SendVerificationMail = (email, emailToken) => {
  try {
    const transporter = nodemailer_1.default.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    (() =>
      __awaiter(void 0, void 0, void 0, function* () {
        const info = yield transporter.sendMail({
          from: `"Vision" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "Email Verification",
          text: `Please verify your email by clicking the following link: https://vision-platform.vercel.app/verify-email?token=${emailToken}`,
          html: `<p>Please verify your email by clicking the link below:</p>
       <a href="https://vision-platform.vercel.app/verify-email?token=${emailToken}">Verify Email</a>`,
        });
      }))();
  } catch (error) {
    alert(error);
  }
};
exports.SendVerificationMail = SendVerificationMail;
