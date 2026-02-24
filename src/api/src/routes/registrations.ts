import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../lib/mock-db";
import {
  CreateRegistrationSchema,
  UpdateStatusSchema,
  SearchQuerySchema,
} from "../lib/schemas";

export const registrationsRouter = new Hono();

// GET /registrations - 一覧取得・検索
registrationsRouter.get(
  "/",
  zValidator("query", SearchQuerySchema),
  (c) => {
    const query = c.req.valid("query");
    const hasFilter = query.id || query.name || query.address;
    const results = hasFilter ? db.search(query) : db.getAll();
    return c.json({ data: results });
  }
);

// GET /registrations/:id - 詳細取得
registrationsRouter.get("/:id", (c) => {
  const id = c.req.param("id");
  const reg = db.getById(id);
  if (!reg) {
    return c.json({ error: "登録番号 " + id + " の記録が見つかりません" }, 404);
  }
  return c.json({ data: reg });
});

// POST /registrations - 新規登録（multipart/form-data）
registrationsRouter.post("/", async (c) => {
  const formData = await c.req.formData();

  // フォームデータからJSONフィールドを抽出
  const fields = {
    name: formData.get("name"),
    nameKana: formData.get("nameKana"),
    dateOfBirth: formData.get("dateOfBirth"),
    gender: formData.get("gender"),
    postalCode: formData.get("postalCode") ?? "",
    address: formData.get("address"),
    addressDetail: formData.get("addressDetail") ?? "",
    mailingNumber: formData.get("mailingNumber"),
    householdNumber: formData.get("householdNumber"),
    sealName: formData.get("sealName"),
  };

  // Zodでバリデーション
  const result = CreateRegistrationSchema.safeParse(fields);
  if (!result.success) {
    return c.json(
      {
        error: "バリデーションエラー",
        issues: result.error.flatten().fieldErrors,
      },
      400
    );
  }

  // 印影画像の処理（任意）
  let sealImageBase64: string | undefined;
  const sealImageFile = formData.get("sealImage");
  if (sealImageFile instanceof File && sealImageFile.size > 0) {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(sealImageFile.type)) {
      return c.json(
        {
          error:
            "印影画像はJPEG、PNG、GIF、WebP形式でアップロードしてください",
        },
        400
      );
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (sealImageFile.size > maxSize) {
      return c.json({ error: "印影画像のサイズは5MB以下にしてください" }, 400);
    }
    const buffer = await sealImageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    sealImageBase64 = `data:${sealImageFile.type};base64,${base64}`;
  }

  const newReg = db.create(result.data, sealImageBase64);
  return c.json({ data: newReg }, 201);
});

// PATCH /registrations/:id/status - ステータス更新
registrationsRouter.patch(
  "/:id/status",
  zValidator("json", UpdateStatusSchema),
  (c) => {
    const id = c.req.param("id");
    const { status } = c.req.valid("json");

    const updated = db.updateStatus(id, status);
    if (!updated) {
      return c.json(
        { error: "登録番号 " + id + " の記録が見つかりません" },
        404
      );
    }
    return c.json({ data: updated });
  }
);
