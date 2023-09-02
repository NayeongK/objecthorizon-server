const Image = require("../models/Image");
const { fetchImageUrlsFromS3 } = require("../services/imageService");
const { buildKDTree, closestPoint } = require("../utils/kd-tree");

exports.get = async function (req, res, next) {
  try {
    const images = await Image.find({});
    const points = images.map(img => [
      img.rgbColor.r,
      img.rgbColor.g,
      img.rgbColor.b,
    ]);
    const tree = buildKDTree(points);
    const { initial } = req.query;
    const imageURLs = await fetchImageUrlsFromS3(
      process.env.AWS_S3_BUCKET_NAME,
    );

    if (initial) {
      res.status(200).json(imageURLs.slice(0, 1));
      return;
    }

    const { color: colorStr } = req.query;
    const color = colorStr.split(",").map(Number);

    const closestImageColor = closestPoint(tree, color);
    const closestImage = images.find(
      img =>
        img.rgbColor.r === closestImageColor[0] &&
        img.rgbColor.g === closestImageColor[1] &&
        img.rgbColor.b === closestImageColor[2],
    );

    res.json(
      closestImage
        ? { url: closestImage.url }
        : { message: "No matching image found" },
    );
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

      const rGroup = Math.floor(color[0] / 43) + 1;
      const gGroup = Math.floor(color[1] / 43) + 1;
      const bGroup = Math.floor(color[2] / 43) + 1;
      const existingImage = await Image.findOne({ url });
      if (!existingImage) {
        await new Image({
          url,
          rgbColor: {
            r: color[0],
            g: color[1],
            b: color[2],
          },
          colorGroup: rGroup * 100 + gGroup * 10 + bGroup,
        }).save();

        res.json({ success: true });
      }
    }
  } catch (err) {
    next(err);
    console.error(err);
  }
};
