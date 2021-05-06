class AppError extends Error {
  constructor({
    status = 500,
    message = "Something bad happened!",
    redirectInfo = {},
  }) {
    super();
    this.status = status;
    this.message = message;
    this.redirectInfo = redirectInfo;
  }
  redirect(req, res) {
    const {
      path = "/",
      data = undefined,
      redirectMsg = "Click here to proceed",
    } = this.redirectInfo;
    if (data) {
      req.session.tempData = data;
    }
    res.location(path);
    res
      .status(this.status)
      .render("error.ejs", { err: this, path, redirectMsg });
  }
}

module.exports = AppError;
