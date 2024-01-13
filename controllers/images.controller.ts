import Image from "../models/Image";
import { fetchImageUrlsFromS3 } from "../services/imageService.js";
import { buildKDTree, closestPoint } from "../utils/kd-tree.js";
import { Request, Response, NextFunction } from "express";

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const images = await Image.find({});
    const points = images.map(img => {
      if (!img.rgbColor) {
        return [0, 0, 0];
      }

      return [img.rgbColor.r, img.rgbColor.g, img.rgbColor.b];
    });
    const tree = buildKDTree(points);

    const initial = req.query.initial as string;
    if (initial) {
      const bucketName = process.env.AWS_S3_BUCKET_NAME;
      if (!bucketName) {
        console.error(
          "AWS S3 bucket name is not defined in environment variables.",
        );
        return;
      }

      const imageURLs = await fetchImageUrlsFromS3(bucketName);
      if (!imageURLs) {
        return res.status(404).json({ message: "Image URLs not found" });
      }
      res.status(200).json(imageURLs.slice(0, 1));
      return;
    }

    const colorStr = req.query.color as string;
    if (!colorStr) {
      return res
        .status(400)
        .json({ message: "Color query parameter is required" });
    }
    const color = colorStr.split(",").map(Number);

    const closestImageColor = closestPoint(tree, color);
    if (!closestImageColor) {
      return res.status(404).json({ message: "No closest image color found" });
    }
    const closestImage = images.find(
      img =>
        img.rgbColor &&
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
}

export async function post(req: Request, res: Response, next: NextFunction) {
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
}
