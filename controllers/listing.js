const Listing = require("../model/Listing");
const mbxGeocondig = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocondig({ accessToken: mapToken });

// index route
const index = async (req, res) => {
  let allListing = await Listing.find();
  res.render("listings/index.ejs", { allListing });
};

// New Listing
const newListing = (req, res) => {
  res.render("listings/new.ejs");
};

// Get listings by id
const getListingById = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you Requested for does Not Exist!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

// Create route
const createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;
  let newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = response.body.features[0].geometry;
  let savedListinng = await newListing.save();
  req.flash("success", "Listing Created Successfully!");
  res.redirect("/listings");
};

// get for edit or update
const renderListing = async (req, res) => {
  const { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you Requested for does Not Exist!");
    res.redirect("/listings");
  }
  let origionalImageUrl = listing.image.url;
  origionalImageUrl = origionalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, origionalImageUrl });
};

const updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated Successfully!");
  res.redirect(`/listings/${id}`);
};

// Delete Route
const deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted Successfully!");
  res.redirect("/listings");
};
module.exports = {
  index,
  newListing,
  getListingById,
  createListing,
  renderListing,
  updateListing,
  deleteListing,
};
