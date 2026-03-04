import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export default {
  name: "File Upload",
  description: "Endpoint for uploading files via POST buffer",
  category: "Tools",
  methods: ["POST"],
  params: ["file"],
  paramsSchema: {
    file: { type: "file", required: true },
  },
  async run(req, res) {
    try {
      // call multer as a promise function
      await new Promise((resolve, reject) => {
        upload.single("file")(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      if (!req.file) {
        return res.status(400).json({ success: false, error: "No file uploaded" });
      }

      res.json({
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};