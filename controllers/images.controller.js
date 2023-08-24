const Image = require("../models/Image");
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
    console.error(err);
  }
};

exports.post = async function (req, res, next) {
  try {
    const { initial } = req.query;
    if (initial) {
      const { url, color } = req.body;
      const existingImage = await Image.findOne({ url });
      if (!existingImage) {
        await new Image({
          url,
          dominantColor: {
            r: color[0],
            g: color[1],
            b: color[2],
          },
        }).save();
      }
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
    console.error(err);
  }
};
