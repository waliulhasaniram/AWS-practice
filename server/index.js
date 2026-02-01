const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { connectDB } = require("./db");
const User = require("./user-model");
require("dotenv").config();
const port = process.env.PORT || 3200;

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const createPresignedUrlWithClient = ({ bucket, key, contentType }) => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
  ], // your frontend url
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.post("/api/get-presigned-url", async (req, res) => {
  const { mime } = req.body;

  const fileName = uuidv4();
  const finalName = `${fileName}.${mime}`;

  const url = await createPresignedUrlWithClient({
    bucket: process.env.S3_BUCKET_NAME,
    key: finalName,
    contentType: mime,
  });
  res.json({ url: url, finalName: finalName });
});

app.post("/api/products", async (req, res) => {
  const { name, email, fileName } = req.body;

  if (!name || !email || !fileName) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  //save to database
  const newUser = await User.create({
    name,
    email,
    fileName,
  });

  console.log("user", newUser);
  res.json({ message: "success!", user: newUser });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`this is the server http://localhost:${port}`);
  });
});
