const Image = require("../models/Image");
const { fetchImageUrlsFromS3 } = require("../services/imageService");
const { getTargetGroups } = require("../utils/targetGroupCalculator");
const { calculateDistance } = require("../utils/distanceCalculator");

exports.get = async function (req, res, next) {
  try {
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
    const rGroup = Math.floor(color[0] / 43) + 1;
    const gGroup = Math.floor(color[1] / 43) + 1;
    const bGroup = Math.floor(color[2] / 43) + 1;
    const colorGroup = rGroup * 100 + gGroup * 10 + bGroup + 1;
    const colorGroupArray = colorGroup.toString().split("").map(Number);
    const currentImageRGB = [color[0], color[1], color[2]];

    const targetGroups = getTargetGroups(
      colorGroupArray[0],
      colorGroupArray[1],
      colorGroupArray[2],
    );

    const targetImages = await Image.find({
      colorGroup: { $in: targetGroups },
    });

    let minDistance = Infinity;
    let closestImage = null;

    for (let i = 0; i < targetImages.length; i++) {
      const targetRGB = [
        targetImages[i].rgbColor.r,
        targetImages[i].rgbColor.g,
        targetImages[i].rgbColor.b,
      ];
      const distance = calculateDistance(currentImageRGB, targetRGB);

      if (distance === 0) continue;

      if (distance < minDistance) {
        minDistance = distance;
        closestImage = targetImages[i];
      }
    }
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
