require("dotenv").config();
const { fetchImageUrlsFromS3 } = require("../services/imageService");

exports.get = async function (req, res, next) {
  try {
    const { initial } = req.query;
    const imageURLs = await fetchImageUrlsFromS3(
      process.env.AWS_S3_BUCKET_NAME,
    );

    if (initial) {
      res.status(200).json(imageURLs);
    }
  } catch (err) {
    next(err);
    console.error("Error retrieving images:", err);
  }
};
