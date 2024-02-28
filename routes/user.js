const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middlewares/middleware");
const userController = require("../controllers/user");

// signup
router
  .route("/signup")
  .get(userController.renderSignup)
  .post(wrapAsync(userController.signup));

// login
router
  .route("/login")
  .get(userController.renderLogin)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

// logout
router.get("/logout", userController.logout);
module.exports = router;
