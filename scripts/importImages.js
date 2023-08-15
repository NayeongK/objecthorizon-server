const mongoose = require("mongoose");
const { saveImagesToDB } = require("../services/imageService");

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", async () => {
  await saveImagesToDB(process.env.AWS_S3_BUCKET_NAME);

  mongoose.connection.close();
  process.exit(0);
});
