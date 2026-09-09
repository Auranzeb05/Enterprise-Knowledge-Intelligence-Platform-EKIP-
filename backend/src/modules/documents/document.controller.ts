import type {
  Request,
  Response,
} from "express";

import type {
  Prisma,
} from "@prisma/client";

import {
  prisma,
} from "../../config/prisma.js";

import {
  recordAudit,
} from "../audit/audit.service.js";

import {
  uploadDocumentFile,
  createDocumentSignedUrl,
  deleteDocumentFile,
} from "../../config/storage.js";

import {
  extractDocumentText,
  splitTextIntoChunks,
} from "./document.processor.js";

import {
  generateEmbeddings,
  saveChunkEmbedding,
} from "./document.embeddings.js";

function getDocumentAccessWhere(
  currentUser: {
    role: string;
    departmentId?: string | null;
  }
): Prisma.DocumentWhereInput {
  if (
    currentUser.role === "admin"
  ) {
    return {};
  }

  const scopeWhere: Prisma.DocumentWhereInput =
    currentUser.departmentId
      ? {
          OR: [
            {
              departmentId: null,
            },
            {
              departmentId:
                currentUser.departmentId,
            },
          ],
        }
      : {
          departmentId: null,
        };

  if (
    currentUser.role === "employee"
  ) {
    return {
      AND: [
        scopeWhere,
        {
          status: "ready",
        },
      ],
    };
  }

  return scopeWhere;
}

function getParamId(
  value:
    | string
    | string[]
    | undefined
) {
  if (
    Array.isArray(value)
  ) {
    return value[0];
  }

  return value;
}

export async function getAllDocuments(
  req: Request,
  res: Response
) {
  try {
    const currentUser =
      res.locals.user;

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const documents =
      await prisma.document.findMany({
        where:
          getDocumentAccessWhere(
            currentUser
          ),

        orderBy: {
          createdAt: "desc",
        },

        include: {
          uploadedBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },

          department: {
            select: {
              id: true,
              name: true,
            },
          },

          _count: {
            select: {
              chunks: true,
            },
          },
        },
      });

    return res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error(
      "Get documents error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load documents",
    });
  }
}

export async function createDocument(
  req: Request,
  res: Response
) {
  let uploadedStoragePath:
    | string
    | null = null;

  let createdDocumentId:
    | string
    | null = null;

  try {
    const currentUser =
      res.locals.user;

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      currentUser.role !==
        "manager" &&
      currentUser.role !==
        "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to upload documents",
      });
    }

    const file =
      req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message:
          "Document file is required",
      });
    }

    const {
      title,
      departmentId,
    } = req.body;

    if (
      typeof title !==
        "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Document title is required",
      });
    }

    let cleanDepartmentId:
      | string
      | null = null;

    if (
      currentUser.role ===
        "manager"
    ) {
      if (
        !currentUser.departmentId
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Your manager account is not assigned to a department",
        });
      }

      if (
        typeof departmentId !==
          "string" ||
        departmentId !==
          currentUser.departmentId
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Managers can upload documents only to their assigned department",
        });
      }
    }

    if (
      departmentId !== undefined &&
      departmentId !== null &&
      departmentId !== ""
    ) {
      if (
        typeof departmentId !==
        "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid department",
        });
      }

      const department =
        await prisma.department.findUnique(
          {
            where: {
              id:
                departmentId,
            },
            select: {
              id: true,
              name: true,
            },
          }
        );

      if (!department) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid department",
        });
      }

      if (
        currentUser.role ===
          "manager" &&
        departmentId !==
          currentUser.departmentId
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Managers can upload documents only to their assigned department",
        });
      }

      cleanDepartmentId =
        departmentId;
    }

    const safeFileName =
      file.originalname.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );

    const uniquePart =
      `${Date.now()}-${crypto.randomUUID()}`;

    const storagePath =
      `${currentUser.id}/${uniquePart}-${safeFileName}`;

    uploadedStoragePath =
      storagePath;

    await uploadDocumentFile(
      file.buffer,
      storagePath,
      file.mimetype
    );

    const document =
      await prisma.document.create({
        data: {
          title:
            title.trim(),

          fileName:
            file.originalname,

          fileType:
            file.mimetype,

          fileSize:
            file.size,

          storagePath,

          uploadedById:
            currentUser.id,

          departmentId:
            cleanDepartmentId,

          status:
            "processing",
        },
      });

    createdDocumentId =
      document.id;

    try {
      const extractedText =
        await extractDocumentText(
          file.buffer,
          file.mimetype
        );

      const chunks =
        splitTextIntoChunks(
          extractedText
        );

      if (
        chunks.length === 0
      ) {
        throw new Error(
          "No readable text could be extracted from the document"
        );
      }

      await prisma.documentChunk.deleteMany(
        {
          where: {
            documentId:
              document.id,
          },
        }
      );

      await prisma.documentChunk.createMany(
        {
          data:
            chunks.map(
              (
                content,
                index
              ) => ({
                documentId:
                  document.id,

                content,

                chunkIndex:
                  index,
              })
            ),
        }
      );

      const savedChunks =
        await prisma.documentChunk.findMany(
          {
            where: {
              documentId:
                document.id,
            },

            orderBy: {
              chunkIndex:
                "asc",
            },

            select: {
              id: true,
              content: true,
            },
          }
        );

      const embeddings =
        await generateEmbeddings(
          savedChunks.map(
            (chunk) =>
              chunk.content
          )
        );

      if (
        embeddings.length !==
        savedChunks.length
      ) {
        throw new Error(
          "Embedding count does not match document chunk count"
        );
      }

      for (
        let index = 0;
        index <
        savedChunks.length;
        index++
      ) {
        const chunk =
          savedChunks[
            index
          ];

        const embedding =
          embeddings[
            index
          ];

        if (
          !chunk ||
          !embedding
        ) {
          throw new Error(
            `Missing embedding for chunk ${index}`
          );
        }

        await saveChunkEmbedding(
          chunk.id,
          embedding
        );
      }

      await prisma.document.update({
        where: {
          id:
            document.id,
        },

        data: {
          status:
            "ready",
        },
      });
    } catch (
      processingError
    ) {
      console.error(
        "Document processing error:",
        processingError
      );

      await prisma.document.update({
        where: {
          id:
            document.id,
        },

        data: {
          status:
            "failed",
        },
      });
    }

    const completeDocument =
      await prisma.document.findUnique(
        {
          where: {
            id:
              document.id,
          },

          include: {
            uploadedBy: {
              select: {
                id: true,
                fullName:
                  true,
                email:
                  true,
              },
            },

            department: {
              select: {
                id: true,
                name: true,
              },
            },

            _count: {
              select: {
                chunks:
                  true,
              },
            },
          },
        }
      );

    if (completeDocument) {
      await recordAudit(req, res, {
        action: "DOCUMENT_UPLOAD",
        resourceType: "document",
        resourceId: completeDocument.id,
        resourceLabel: completeDocument.title,
        status: completeDocument.status === "failed" ? "failure" : "success",
        metadata: {
          fileName: completeDocument.fileName,
          status: completeDocument.status,
          departmentId: completeDocument.departmentId,
          chunks: completeDocument._count.chunks,
        },
      });
    }

    return res.status(201).json({
      success: true,
      document:
        completeDocument,
    });
  } catch (error) {
    console.error(
      "Create document error:",
      error
    );

    if (
      createdDocumentId
    ) {
      try {
        await prisma.document.delete(
          {
            where: {
              id:
                createdDocumentId,
            },
          }
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Document database cleanup error:",
          cleanupError
        );
      }
    }

    if (
      uploadedStoragePath
    ) {
      try {
        await deleteDocumentFile(
          uploadedStoragePath
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Document storage cleanup error:",
          cleanupError
        );
      }
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to upload document",
    });
  }
}

export async function getDocumentById(
  req: Request,
  res: Response
) {
  try {
    const currentUser =
      res.locals.user;

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const id =
      getParamId(
        req.params.id
      );

    if (
      !id ||
      !id.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid document ID",
      });
    }

    const document =
      await prisma.document.findFirst(
        {
          where: {
            AND: [
              {
                id,
              },
              getDocumentAccessWhere(
                currentUser
              ),
            ],
          },

          include: {
            uploadedBy: {
              select: {
                id: true,
                fullName:
                  true,
                email:
                  true,
              },
            },

            department: {
              select: {
                id: true,
                name: true,
              },
            },

            chunks: {
              orderBy: {
                chunkIndex:
                  "asc",
              },
            },
          },
        }
      );

    if (!document) {
      return res.status(404).json({
        success: false,
        message:
          "Document not found",
      });
    }

    return res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    console.error(
      "Get document error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load document",
    });
  }
}

export async function getDocumentDownloadUrl(
  req: Request,
  res: Response
) {
  try {
    const currentUser =
      res.locals.user;

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const id =
      getParamId(
        req.params.id
      );

    if (
      !id ||
      !id.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid document ID",
      });
    }

    const document =
      await prisma.document.findFirst(
        {
          where: {
            AND: [
              {
                id,
              },
              getDocumentAccessWhere(
                currentUser
              ),
            ],
          },

          select: {
            id: true,
            fileName: true,
            storagePath:
              true,
          },
        }
      );

    if (!document) {
      return res.status(404).json({
        success: false,
        message:
          "Document not found",
      });
    }

    const signedUrl =
      await createDocumentSignedUrl(
        document.storagePath
      );

    await recordAudit(req, res, {
      action: "DOCUMENT_DOWNLOAD",
      resourceType: "document",
      resourceId: document.id,
      resourceLabel: document.fileName,
    });

    return res.status(200).json({
      success: true,
      fileName:
        document.fileName,
      signedUrl,
    });
  } catch (error) {
    console.error(
      "Document download URL error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create document download URL",
    });
  }
}

export async function deleteDocument(
  req: Request,
  res: Response
) {
  try {
    const currentUser = res.locals.user;
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const id = getParamId(req.params.id);
    if (!id || !id.trim()) {
      return res.status(400).json({ success: false, message: "Invalid document ID" });
    }

    const document = await prisma.document.findUnique({
      where: { id },
      select: { id: true, title: true, storagePath: true },
    });

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    await deleteDocumentFile(document.storagePath);
    await prisma.document.delete({ where: { id } });

    await recordAudit(req, res, {
      action: "DOCUMENT_DELETE",
      resourceType: "document",
      resourceId: document.id,
      resourceLabel: document.title,
    });

    return res.status(200).json({
      success: true,
      message: `Deleted ${document.title}`,
    });
  } catch (error) {
    console.error("Delete document error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete document" });
  }
}
