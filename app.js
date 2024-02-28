if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const mongoUrl = process.env.MONGODB_URL;
const port = process.env.PORT;

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./model/User");

// routes
const ListingsRoute = require("./routes/listing");
const ReviewsRoute = require("./routes/review");
const UsersRoute = require("./routes/user");
const { configDotenv } = require("dotenv");

main()
  .then(console.log("Database Connection Successful"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(mongoUrl);
}

app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());
app.engine("ejs", ejsMate);

const store = MongoStore.create({
  mongoUrl: mongoUrl,
  crypto: { secret: process.env.SECRET },
  touchAfter: 24 * 3600,
});
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.use("/listings", ListingsRoute);
app.use("/listings/:id/reviews", ReviewsRoute);
app.use("/", UsersRoute);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong" } = err;
  res.status(statusCode).render("error.ejs", { err });
});

app.listen(port, () => {
  console.log(`App Listening on port ${port}`);
});
