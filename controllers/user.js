const User = require("../model/User");

// render signup form
const renderSignup = (req, res) => {
  res.render("users/signup.ejs");
};

// finish register
const signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    let newUser = await new User({ email, username });
    let registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust");
      res.redirect("/listings");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/signup");
  }
};

// render login form
const renderLogin = (req, res) => {
  res.render("users/login.ejs");
};

const login = async (req, res) => {
  req.flash("success", "Welcome to Wanderlust! You are logged in!");
  res.redirect(res.locals.redirectUrl ? res.locals.redirectUrl : "/listings");
};
const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next();
    }
    req.flash("success", "You are logged Out");
    res.redirect("/listings");
  });
};

module.exports = {
  renderSignup,
  signup,
  renderLogin,
  login,
  logout,
};
