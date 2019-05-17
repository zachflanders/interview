const express = require("express");
const {getReviews, createReview } = require("../controllers/review");

const router = express.Router();

router.get("/api/reviews", getReviews);
router.post("/api/review/add", createReview);

module.exports = router;
