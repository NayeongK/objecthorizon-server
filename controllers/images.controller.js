const Image = require("../models/Image");

exports.get = async function (req, res, next) {
  const offset = parseInt(req.query.offset, 10) || 0;
  const limit = parseInt(req.query.limit, 10) || 10;

  try {
    const totalImagesCount = await Image.countDocuments();
    const totalPages = Math.ceil(totalImagesCount / limit);
    const images = await Image.find().skip(offset).limit(limit).lean();

    res.status(200).json({
      totalPages,
      images,
    });
  } catch (err) {
    console.error("Error fetching images:", err);
    next(err);
  }
};
