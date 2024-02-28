const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");

const {
  isLoggedIn,
  validateReview,
  isReviewAuthor,
} = require("../middlewares/middleware");
const { newReview, deleteReview } = require("../controllers/review");

// reviews
// Post review Route
router.post("/", isLoggedIn, validateReview, wrapAsync(newReview));

// delete review  route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(deleteReview)
);

module.exports = router;
