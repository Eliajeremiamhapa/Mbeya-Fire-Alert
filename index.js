import express from "express";
import Replicate from "replicate";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

app.post("/generate-video", async (req, res) => {
  try {
    const { prompt } = req.body;

    const output = await replicate.run("wan-video/wan-2.2-t2v-fast", {
      input: {
        prompt: prompt,
        // Optional settings:
        num_frames: 24,
        fps: 8,
        width: 512,
        height: 320
      }
    });

    res.json({ success: true, video: output });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});