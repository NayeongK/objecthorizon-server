import { S3 } from "aws-sdk";
import { getS3Client, getListObjectsCommand } from "../utils/s3Utils";

export async function fetchImageUrlsFromS3(
  bucketName: string,
  prefix: string = "",
  delimiter: string = "/",
) {
  const s3Client = getS3Client();
  const command = getListObjectsCommand(bucketName, prefix, delimiter);

  try {
    const { Contents } = await s3Client.send(command);
    if (!Contents) {
      return [];
    }
    const imageURLs = Contents.map(
      (object: S3.Object) =>
        `https://${bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${object.Key}`,
    );

    return imageURLs;
  } catch (err) {
    console.error("Error retrieving or fetching images:", err);
  }
}
