import type { Express } from "express";
import { storagePut } from "./storage";

/**
 * Register audio upload route for consultation recordings.
 * LGPD compliance: audio files are stored temporarily for transcription only.
 * The transcription procedure deletes the audio after processing.
 */
export function registerAudioUploadRoute(app: Express) {
  app.post("/api/upload-audio", async (req, res) => {
    try {
      // Handle multipart form data manually since we have express.json middleware
      // The audio comes as base64 in JSON body for simplicity
      const { audioBase64, mimeType = "audio/webm" } = req.body as {
        audioBase64?: string;
        mimeType?: string;
      };

      if (!audioBase64) {
        res.status(400).json({ error: "No audio data provided" });
        return;
      }

      const buffer = Buffer.from(audioBase64, "base64");
      const key = `audio-temp/${Date.now()}-recording.webm`;
      const { url } = await storagePut(key, buffer, mimeType);

      res.json({ url, key });
    } catch (err) {
      console.error("[AudioUpload] Error:", err);
      res.status(500).json({ error: "Failed to upload audio" });
    }
  });
}
