require("dotenv").config();
const Image = require("../models/Image");
const { getS3Client, getListObjectsCommand } = require("../utils/s3Utils");

async function saveImagesToDB(bucketName, prefix, delimiter) {
  const s3Client = getS3Client();
  const command = getListObjectsCommand(bucketName, prefix, delimiter);

  try {
    const { Contents } = await s3Client.send(command);
    const imageURLs = Contents.map(
      object =>
        `https://${bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${object.Key}`,
    );

    let prevImage = null;
    let firstImage = null;

    for (let i = 0; i < imageURLs.length; i++) {
      const currentImage = new Image({ url: imageURLs[i] });

      if (i === 0) {
        firstImage = currentImage;
      } else {
        currentImage.prev = prevImage._id;
        prevImage.next = currentImage._id;
        await prevImage.save();
      }

      await currentImage.save();
      prevImage = currentImage;
    }

    firstImage.prev = prevImage._id;
    prevImage.next = firstImage._id;

    await firstImage.save();
    await prevImage.save();
  } catch (err) {
    console.error("Error retrieving or saving images:", err);
  }
}

module.exports = {
  saveImagesToDB,
};
