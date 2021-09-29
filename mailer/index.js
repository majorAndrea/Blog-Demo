const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");

const DEFAULT_EMAIL = process.env.BLOG_DEMO_EMAIL;

const transporter = nodemailer.createTransport(
  sendGridTransport({
    auth: {
      api_key: process.env.SENDGRID_KEY,
    },
  })
);

class Email {
  constructor({ to = "", from = DEFAULT_EMAIL, subject = "", body = "" }) {
    this.to = to;
    this.from = from;
    this.subject = subject;
    this.body = body;
  }

  #checkEmailFieldsValidity() {
    if (
      this.to.length > 0 &&
      this.from.length > 0 &&
      this.subject.length > 0 &&
      this.body.length > 0
    ) {
      return true;
    }
    const missingFields = [
      [this.to, "to"],
      [this.from, "from"],
      [this.subject, "subject"],
      [this.body, "body"],
    ]
      .map((param) => {
        if (param[0].length === 0) {
          return param[1];
        }
        return;
      })
      .join(" ")
      .trim();

    throw new Error(`Email is missing these fields: ${missingFields}`);
  }

  applyResetPswTemplateToBody({ generatedToken, tokenExpireMs, username }) {
    const url =
      process.env.NODE_ENV !== "production"
        ? `http://localhost:${process.env.PORT}/users/${username}/password_reset?token=${generatedToken}`
        : `${process.env.BLOG_DEMO_URL}/users/${username}/password_reset?token=${generatedToken}`;

    this.body = `
      <h1>You have requested a password reset</h1>

      <h3>Your link to reset the password:</h3>
      <a href="${url}" >Click here to reset the password</a>

      <p>Your token will expire within ${tokenExpireMs / 1000 / 60} minutes.</p>
    `;

    return this;
  }

  sendEmail() {
    if (this.#checkEmailFieldsValidity()) {
      return transporter.sendMail({
        to: this.to,
        from: this.from,
        subject: this.subject,
        html: this.body,
      });
    }
  }
}

module.exports = Email;
