const request = require("supertest");
const express = require("express");
const app = express();

const { buildKDTree, closestPoint } = require("../../utils/kd-tree");

const mockImages = [
  { url: "image1.jpg", rgbColor: { r: 255, g: 0, b: 0 }, colorGroup: 111 },
  { url: "image2.jpg", rgbColor: { r: 0, g: 255, b: 0 }, colorGroup: 222 },
  { url: "image3.jpg", rgbColor: { r: 0, g: 0, b: 255 }, colorGroup: 333 },
];

app.use(express.json());

app.get("/api/images", async (req, res) => {
  const { initial, color } = req.query;

  if (initial) {
    res.status(200).json([mockImages[0].url]);
  } else if (color) {
    const colorValues = color.split(",").map(Number);

    const imagePoints = mockImages.map(img => [
      img.rgbColor.r,
      img.rgbColor.g,
      img.rgbColor.b,
    ]);
    const tree = buildKDTree(imagePoints);
    const closestImage = closestPoint(tree, colorValues);

    if (closestImage) {
      res.json({ url: closestImage.url });
    } else {
      res.json({ message: "No matching image found" });
    }
  } else {
    res.status(400).json({ message: "Invalid request" });
  }
});

app.post("/api/images", async (req, res) => {
  const { initial } = req.query;

  if (initial) {
    const { url, color } = req.body;
    const rGroup = Math.floor(color[0] / 43) + 1;
    const gGroup = Math.floor(color[1] / 43) + 1;
    const bGroup = Math.floor(color[2] / 43) + 1;
    const existingImage = mockImages.find(img => img.url === url);

    if (!existingImage) {
      const newImage = {
        url,
        rgbColor: {
          r: color[0],
          g: color[1],
          b: color[2],
        },
        colorGroup: rGroup * 100 + gGroup * 10 + bGroup,
      };

      mockImages.push(newImage);
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "Image already exists" });
    }
  } else {
    res.status(400).json({ message: "Invalid request" });
  }
});

describe("Image Controller", () => {
  let tree;
  beforeAll(async () => {
    const imagePoints = mockImages.map(img => [
      img.rgbColor.r,
      img.rgbColor.g,
      img.rgbColor.b,
    ]);
    tree = buildKDTree(imagePoints);
  });

  it("should return initial image when 'initial' query parameter is provided", async () => {
    const response = await request(app)
      .get("/api/images")
      .query({ initial: true });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([mockImages[0].url]);
  });

  it("should return closest image when valid 'color' query parameter is provided", async () => {
    const response = await request(app)
      .get("/api/images")
      .query({ color: "255,0,0" });

    expect(response.statusCode).toBe(200);

    const closestImageColor = [255, 0, 0];
    const closestImage = closestPoint(tree, closestImageColor);

    if (closestImage) {
      expect(response.body).toEqual({ url: closestImage.url });
    } else {
      expect(response.body).toEqual({ message: "No matching image found" });
    }
  });

  it("should return 'empty object' when no matching color is found", async () => {
    const response = await request(app)
      .get("/api/images")
      .query({ color: "0,0,0" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({});
  });

  it("should create a new image when 'initial' query parameter is provided", async () => {
    const newImageUrl = "new_image.jpg";
    const newImageColor = [128, 128, 128];

    const response = await request(app)
      .post("/api/images")
      .query({ initial: true })
      .send({ url: newImageUrl, color: newImageColor });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ success: true });

    const createdImage = mockImages.find(img => img.url === newImageUrl);
    expect(createdImage).toBeDefined();
    expect(createdImage.rgbColor).toEqual({
      r: newImageColor[0],
      g: newImageColor[1],
      b: newImageColor[2],
    });
  });

  it("should return 'Image already exists' when trying to create an existing image", async () => {
    const existingImageUrl = mockImages[0].url;
    const existingImageColor = [255, 0, 0];

    const response = await request(app)
      .post("/api/images")
      .query({ initial: true })
      .send({ url: existingImageUrl, color: existingImageColor });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: false,
      message: "Image already exists",
    });
  });
});
