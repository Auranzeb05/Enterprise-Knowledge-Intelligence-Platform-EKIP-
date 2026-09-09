import mammoth from "mammoth";
import JSZip from "jszip";

import {
  PDFParse,
} from "pdf-parse";

const CHUNK_SIZE =
  1200;

const CHUNK_OVERLAP =
  200;

function normalizeText(
  text: string
) {
  return text
    .replace(
      /\r\n/g,
      "\n"
    )
    .replace(
      /\r/g,
      "\n"
    )
    .replace(
      /[ \t]+/g,
      " "
    )
    .replace(
      /\n{3,}/g,
      "\n\n"
    )
    .trim();
}

async function extractPdfText(
  buffer: Buffer
) {
  const parser =
    new PDFParse({
      data: buffer,
    });

  try {
    const result =
      await parser.getText();

    return result.text || "";
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(
  buffer: Buffer
) {
  const result =
    await mammoth.extractRawText({
      buffer,
    });

  return result.value || "";
}

async function extractPptxText(
  buffer: Buffer
) {
  const zip =
    await JSZip.loadAsync(
      buffer
    );

  const slideFiles =
    Object.keys(
      zip.files
    )
      .filter(
        (fileName) =>
          /^ppt\/slides\/slide\d+\.xml$/.test(
            fileName
          )
      )
      .sort(
        (
          first,
          second
        ) => {
          const firstNumber =
            Number(
              first.match(
                /slide(\d+)\.xml$/
              )?.[1] ||
                0
            );

          const secondNumber =
            Number(
              second.match(
                /slide(\d+)\.xml$/
              )?.[1] ||
                0
            );

          return (
            firstNumber -
            secondNumber
          );
        }
      );

  const slideTexts:
    string[] = [];

  for (
    const fileName of
    slideFiles
  ) {
    const slide =
      zip.file(
        fileName
      );

    if (!slide) {
      continue;
    }

    const xml =
      await slide.async(
        "string"
      );

    const textMatches =
      [
        ...xml.matchAll(
          /<a:t>([\s\S]*?)<\/a:t>/g
        ),
      ];

    const slideText =
      textMatches
        .map(
          (match) =>
            decodeXmlEntities(
              match[1] ||
                ""
            )
        )
        .join(" ")
        .trim();

    if (slideText) {
      slideTexts.push(
        slideText
      );
    }
  }

  return slideTexts.join(
    "\n\n"
  );
}

function decodeXmlEntities(
  value: string
) {
  return value
    .replace(
      /&amp;/g,
      "&"
    )
    .replace(
      /&lt;/g,
      "<"
    )
    .replace(
      /&gt;/g,
      ">"
    )
    .replace(
      /&quot;/g,
      '"'
    )
    .replace(
      /&apos;/g,
      "'"
    );
}

export async function extractDocumentText(
  buffer: Buffer,
  mimeType: string
) {
  let extractedText =
    "";

  switch (
    mimeType
  ) {
    case "text/plain": {
      extractedText =
        buffer.toString(
          "utf8"
        );

      break;
    }

    case "application/pdf": {
      extractedText =
        await extractPdfText(
          buffer
        );

      break;
    }

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      extractedText =
        await extractDocxText(
          buffer
        );

      break;
    }

    case "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
      extractedText =
        await extractPptxText(
          buffer
        );

      break;
    }

    default: {
      throw new Error(
        "Unsupported document type"
      );
    }
  }

  const normalized =
    normalizeText(
      extractedText
    );

  if (!normalized) {
    throw new Error(
      "No readable text could be extracted from the document"
    );
  }

  return normalized;
}

export function splitTextIntoChunks(
  text: string
) {
  const normalized =
    normalizeText(
      text
    );

  if (!normalized) {
    return [];
  }

  if (
    normalized.length <=
    CHUNK_SIZE
  ) {
    return [
      normalized,
    ];
  }

  const chunks:
    string[] = [];

  let start =
    0;

  while (
    start <
    normalized.length
  ) {
    let end =
      Math.min(
        start +
          CHUNK_SIZE,
        normalized.length
      );

    if (
      end <
      normalized.length
    ) {
      const section =
        normalized.slice(
          start,
          end
        );

      const paragraphBreak =
        section.lastIndexOf(
          "\n\n"
        );

      const sentenceBreak =
        Math.max(
          section.lastIndexOf(
            ". "
          ),
          section.lastIndexOf(
            "? "
          ),
          section.lastIndexOf(
            "! "
          )
        );

      const wordBreak =
        section.lastIndexOf(
          " "
        );

      const minimumBreak =
        Math.floor(
          CHUNK_SIZE *
            0.6
        );

      if (
        paragraphBreak >=
        minimumBreak
      ) {
        end =
          start +
          paragraphBreak;
      } else if (
        sentenceBreak >=
        minimumBreak
      ) {
        end =
          start +
          sentenceBreak +
          1;
      } else if (
        wordBreak >=
        minimumBreak
      ) {
        end =
          start +
          wordBreak;
      }
    }

    const chunk =
      normalized
        .slice(
          start,
          end
        )
        .trim();

    if (chunk) {
      chunks.push(
        chunk
      );
    }

    if (
      end >=
      normalized.length
    ) {
      break;
    }

    const nextStart =
      Math.max(
        end -
          CHUNK_OVERLAP,
        start + 1
      );

    start =
      nextStart;
  }

  return chunks;
}