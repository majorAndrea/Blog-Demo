const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");

const DEFAULT_EMAIL = "am.blog.demo@gmail.com";

const transporter = nodemailer.createTransport(
  sendGridTransport({
    auth: {
      api_key: process.env.SENDGRID_KEY,
    },
  })
);

class Mail {
  constructor({ to, from = DEFAULT_EMAIL, subject, body }) {
    this.to = to;
    this.from = from;
    this.subject = subject;
    this.body = body;
  }

  #checkFieldsValidity() {
    if (
      this.to.length > 0 &&
      this.from.length > 0 &&
      this.subject.length > 0 &&
      this.body.length > 0
    ) {
      return true;
    }
    return false;
  }

  sendMail() {
    if (this.#checkFieldsValidity()) {
      return transporter.sendMail({
        to: this.to,
        from: this.from,
        subject: this.subject,
        html: this.body,
      });
    }
  }
}

module.exports = Mail;
