import multer from "multer";

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_MIME_TYPES =
  new Set([
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ]);

const storage =
  multer.memoryStorage();

export const documentUpload =
  multer({
    storage,

    limits: {
      fileSize:
        MAX_FILE_SIZE,
      files: 1,
    },

    fileFilter: (
      req,
      file,
      callback
    ) => {
      if (
        !ALLOWED_MIME_TYPES.has(
          file.mimetype
        )
      ) {
        callback(
          new Error(
            "Unsupported file type. Allowed formats: PDF, TXT, DOCX, PPTX"
          )
        );

        return;
      }

      callback(
        null,
        true
      );
    },
  });