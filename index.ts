import * as fs from "fs/promises";
import Mustache from "mustache";
import express from "express";
import dotenv from "dotenv";
import path from "path";
import nodemailer from "nodemailer";
import cors from "cors";
import {
  IRequestResetData,
  IShareReport,
  IVerifyData,
  IWelcomeData,
} from "./src/types/payload.types";

async function customizeEmail<T>(data: T, templateName: string) {
  const templatesDir = path.join(__dirname, "build_production");
  const templatePath = path.join(templatesDir, templateName);
  const html = (await fs.readFile(templatePath)).toString();

  const view = { ...data };
  const customized = Mustache.render(html, view);

  return customized;
}

async function sendEmail(
  html: string,
  to: string,
  subject: string,
  attachment?: string,
  filename?: string
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject,
    html,
    ...(attachment?.length && {
      attachments: [
        {
          filename,
          path: attachment,
        },
      ],
    }),
  };

  transporter.sendMail(
    { ...mailOptions, attachDataUrls: true },
    function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    }
  );
}

async function main() {
  dotenv.config();

  const app = express();
  app.use(express.json());
  app.use(cors({ origin: "*" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/", async (req, res) => {
    const { name, url } = req.query;
    const html = await customizeEmail({ name, url }, "request-reset.html");

    res.type("html");
    res.send(html);
  });

  app.post("/send/verify", async (req, res) => {
    const body = req.body as IVerifyData;
    const html = await customizeEmail(body, "verify.html");
    await sendEmail(html, body.email, "Verify your Email Address");

    res.send(`Successfully sent email to ${body.email}`);
  });

  app.post("/send/forgot-password", async (req, res) => {
    const body = req.body as IVerifyData;
    const html = await customizeEmail(body, "request-forgot-password.html");
    await sendEmail(html, body.email, "Reset Password");

    res.send(`Successfully sent email to ${body.email}`);
  });

  app.listen(3000, () => console.log("http://localhost:3000"));
}

main();
