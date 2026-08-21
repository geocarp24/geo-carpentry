import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Readable } from "stream";
import { ENV } from "./_core/env";

function normalizeKey(relKey: string) { return relKey.replace(/^\/+/, ""); }
function appendHashSuffix(relKey: string) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  return lastDot === -1 ? `${relKey}_${hash}` : `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

function useHostingerStorage() {
  return Boolean(ENV.s3Endpoint && ENV.s3Bucket && ENV.s3AccessKeyId && ENV.s3SecretAccessKey);
}

export function storageIsSelfHosted() { return useHostingerStorage(); }

function s3Client(endpoint = ENV.s3Endpoint) {
  if (!useHostingerStorage()) throw new Error("La configuración S3 de Hostinger no está disponible");
  return new S3Client({
    region: ENV.s3Region,
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId: ENV.s3AccessKeyId, secretAccessKey: ENV.s3SecretAccessKey },
  });
}

function forgeConfig() {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) throw new Error("Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY");
  return { forgeUrl: ENV.forgeApiUrl.replace(/\/+$/, ""), forgeKey: ENV.forgeApiKey };
}

export async function storagePrepareDirectUpload(relKey: string): Promise<{ key: string; uploadUrl: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  if (useHostingerStorage()) {
    const uploadUrl = await getSignedUrl(s3Client(ENV.s3PublicEndpoint), new PutObjectCommand({ Bucket: ENV.s3Bucket, Key: key }), { expiresIn: 900 });
    return { key, uploadUrl };
  }
  const { forgeUrl, forgeKey } = forgeConfig();
  const endpoint = new URL("v1/storage/presign/put", `${forgeUrl}/`);
  endpoint.searchParams.set("path", key);
  const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${forgeKey}` } });
  if (!response.ok) throw new Error(`Storage presign failed (${response.status})`);
  const { url } = await response.json() as { url: string };
  if (!url) throw new Error("Forge returned empty presign URL");
  return { key, uploadUrl: url };
}

export async function storagePut(relKey: string, data: Buffer | Uint8Array | string, contentType = "application/octet-stream") {
  const key = appendHashSuffix(normalizeKey(relKey));
  if (useHostingerStorage()) {
    await s3Client().send(new PutObjectCommand({ Bucket: ENV.s3Bucket, Key: key, Body: data, ContentType: contentType }));
    return storageGet(key);
  }
  const { key: generatedKey, uploadUrl } = await storagePrepareDirectUpload(relKey);
  const body = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data as any], { type: contentType });
  const response = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": contentType }, body });
  if (!response.ok) throw new Error(`Storage upload to S3 failed (${response.status})`);
  return { key: generatedKey, url: `/manus-storage/${generatedKey}` };
}

export async function storagePutStream(relKey: string, body: Readable, contentType = "application/octet-stream", contentLength?: number) {
  if (!useHostingerStorage()) throw new Error("La migración en streaming solo está disponible en Hostinger");
  const key = appendHashSuffix(normalizeKey(relKey));
  await s3Client().send(new PutObjectCommand({ Bucket: ENV.s3Bucket, Key: key, Body: body, ContentType: contentType, ContentLength: contentLength }));
  return storageGet(key);
}

export async function storageGet(relKey: string) {
  const key = normalizeKey(relKey);
  return { key, url: useHostingerStorage() ? `/api/media/file?key=${encodeURIComponent(key)}` : `/manus-storage/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  if (useHostingerStorage()) return getSignedUrl(s3Client(ENV.s3PublicEndpoint), new GetObjectCommand({ Bucket: ENV.s3Bucket, Key: key }), { expiresIn: 900 });
  const { forgeUrl, forgeKey } = forgeConfig();
  const endpoint = new URL("v1/storage/presign/get", `${forgeUrl}/`);
  endpoint.searchParams.set("path", key);
  const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${forgeKey}` } });
  if (!response.ok) throw new Error(`Storage signed URL failed (${response.status})`);
  const { url } = await response.json() as { url: string };
  return url;
}

export async function storageGetObject(relKey: string) {
  if (!useHostingerStorage()) throw new Error("La lectura directa de objetos solo está disponible en Hostinger");
  return s3Client().send(new GetObjectCommand({ Bucket: ENV.s3Bucket, Key: normalizeKey(relKey) }));
}
