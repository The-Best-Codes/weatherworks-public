import { NextApiRequest, NextApiResponse } from "next";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let text, voice;

  if (req.method === "GET") {
    text = req.query.text;
    voice = req.query.voice || "en-US-AvaMultilingualNeural";
  } else if (req.method === "POST") {
    text = req.body.text;
    voice = req.body.voice || "en-US-AvaMultilingualNeural";
  } else {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!text) {
    res.status(400).json({ error: "Text is required" });
    return;
  }

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.WEBM_24KHZ_16BIT_MONO_OPUS);

    // Create a temporary file path
    const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.webm`);
    const filePath = await tts.toFile(tempFilePath, text);

    // Send the audio file as a response
    const fileStream = fs.createReadStream(filePath);
    res.setHeader("Content-Type", "audio/webm");
    fileStream.pipe(res);

    // Clean up the temporary file after the response is sent
    fileStream.on("end", () => {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting temporary file:", err);
        }
      });
    });
  } catch (error) {
    console.error("Error creating audio:", error);
    res.status(500).json({ error: "Failed to create audio" });
  }
}
