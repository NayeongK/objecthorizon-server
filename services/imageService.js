require("dotenv").config();
const { getS3Client, getListObjectsCommand } = require("../utils/s3Utils");

async function fetchImageUrlsFromS3(bucketName, prefix, delimiter) {
  const s3Client = getS3Client();
  const command = getListObjectsCommand(bucketName, prefix, delimiter);

  try {
    const { Contents } = await s3Client.send(command);
    const imageURLs = Contents.map(
      object =>
        `https://${bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${object.Key}`,
    );

    return imageURLs;
  } catch (err) {
    console.error("Error retrieving or fetching images:", err);
  }
}

module.exports = {
  fetchImageUrlsFromS3,
};
