/**
 * Cloudflare R2 存儲適配器
 * 用於 Workers 環境存儲用戶上傳的文件
 */

export interface R2Storage {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | string,
    options?: R2PutOptions
  ): Promise<R2Object>;
  get(key: string, options?: R2GetOptions): Promise<R2Object | null>;
  delete(key: string): Promise<void>;
}

export interface R2PutOptions {
  httpMetadata?: {
    contentType?: string;
    contentEncoding?: string;
    cacheControl?: string;
  };
  customMetadata?: Record<string, string>;
}

export interface R2GetOptions {
  onlyIf?: R2Conditional;
  range?: R2Range;
}

export interface R2Object {
  key: string;
  version: string;
  size: number;
  etag: string;
  httpEtag: string;
  uploaded: Date;
  checksums: R2Checksums;
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
  body?: ReadableStream;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T>(): Promise<T>;
}

export interface R2Conditional {
  etagMatches?: string;
  etagDoesNotMatch?: string;
  uploadedBefore?: Date;
  uploadedAfter?: Date;
}

export interface R2Range {
  offset?: number;
  length?: number;
  suffix?: number;
}

export interface R2Checksums {
  md5?: ArrayBuffer;
  sha1?: ArrayBuffer;
  sha256?: ArrayBuffer;
  sha384?: ArrayBuffer;
  sha512?: ArrayBuffer;
}

export interface R2HTTPMetadata {
  contentType?: string;
  contentEncoding?: string;
  contentDisposition?: string;
  contentLanguage?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}

export interface FileMetadata {
  fileName: string;
  fileType: string;
  uploadedAt: number;
  size: number;
}

/**
 * 上傳文件到 R2
 */
export async function uploadFileToR2(
  r2: R2Storage,
  buffer: ArrayBuffer,
  fileName: string,
  fileType: string,
  metadata?: Record<string, string>
): Promise<{ key: string }> {
  const timestamp = Date.now();
  // 使用時間戳和文件名生成唯一鍵
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `uploads/${timestamp}-${sanitizedFileName}`;

  await r2.put(key, buffer, {
    httpMetadata: {
      contentType: fileType,
    },
    customMetadata: {
      originalFileName: fileName,
      uploadedAt: timestamp.toString(),
      ...metadata,
    },
  });

  console.log(`✅ File uploaded to R2: ${key}`);

  return { key };
}

/**
 * 從 R2 獲取文件
 */
export async function getFileFromR2(
  r2: R2Storage,
  key: string
): Promise<ArrayBuffer | null> {
  const object = await r2.get(key);
  if (!object) return null;

  return await object.arrayBuffer();
}

/**
 * 從 R2 刪除文件
 */
export async function deleteFileFromR2(
  r2: R2Storage,
  key: string
): Promise<void> {
  await r2.delete(key);
  console.log(`🗑️ File deleted from R2: ${key}`);
}

/**
 * 檢查文件是否存在
 */
export async function fileExistsInR2(
  r2: R2Storage,
  key: string
): Promise<boolean> {
  const object = await r2.get(key);
  return object !== null;
}

