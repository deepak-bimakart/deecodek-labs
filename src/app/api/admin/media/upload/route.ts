import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { getCurrentUser, audit, can } from "@/lib/rbac";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
  "video/mp4",
  "video/webm",
]);

function safeExt(name: string, mime: string) {
  const fromName = path.extname(name).toLowerCase().replace(/[^a-z0-9.]/g, "");
  if (fromName) return fromName;
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    "application/pdf": ".pdf",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
  };
  return map[mime] ?? "";
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user.role, "media.upload")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!useBlob) await mkdir(uploadDir, { recursive: true });

  const created = [];

  for (const file of files) {
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported type: ${file.type || file.name}` },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large: ${file.name} (max 10MB)` },
        { status: 400 }
      );
    }

    const ext = safeExt(file.name, file.type);
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    let storageKey = `uploads/${filename}`;
    let url = `/${storageKey}`;

    if (useBlob) {
      const blob = await put(`uploads/${filename}`, buffer, {
        access: "public",
        contentType: file.type,
      });
      storageKey = blob.pathname;
      url = blob.url;
    } else {
      await writeFile(path.join(uploadDir, filename), buffer);
    }

    let width: number | null = null;
    let height: number | null = null;
    if (file.type.startsWith("image/") && file.type !== "image/svg+xml") {
      try {
        const meta = await sharp(buffer).metadata();
        width = meta.width ?? null;
        height = meta.height ?? null;
      } catch {
        // ignore
      }
    }

    const asset = await db.mediaAsset.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        width,
        height,
        storageKey,
        url,
        uploadedById: user.id,
      },
      include: { uploadedBy: { select: { name: true, email: true } } },
    });

    await audit({
      action: "create",
      entityType: "media",
      entityId: asset.id,
      userId: user.id,
      metadata: { filename: file.name, size: file.size, blob: useBlob },
    });

    created.push(asset);
  }

  return NextResponse.json({ media: created }, { status: 201 });
}
