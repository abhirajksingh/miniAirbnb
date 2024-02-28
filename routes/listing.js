const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const {
  isLoggedIn,
  isOwner,
  validateListing,
} = require("../middlewares/middleware");
const listingController = require("../controllers/listing");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

// New Listing
router.get("/new", isLoggedIn, listingController.newListing);

router
  .route("/:id")
  .get(wrapAsync(listingController.getListingById))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderListing)
);

module.exports = router;
