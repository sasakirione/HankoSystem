import { z } from "zod";

export const SealRegistrationStatusSchema = z.enum(["照会中", "照会取消", "登録", "抹消"]);

export const GenderSchema = z.enum(["男", "女"]);

export const SealNameCategorySchema = z.enum([
  "氏名",
  "氏のみ",
  "名のみ",
  "旧氏と名",
  "旧氏",
  "氏頭文字と名頭文字",
  "氏頭文字と名",
  "氏と名頭文字",
  "旧氏頭文字と名頭文字",
  "旧氏頭文字と名",
  "旧氏と名頭文字",
  "その他",
]);

export const RegistrationMethodSchema = z.enum(["即時", "照会"]);

export const CreateRegistrationSchema = z.object({
  name: z.string().min(1, "氏名は必須です"),
  nameKana: z
    .string()
    .min(1, "フリガナは必須です")
    .regex(/^[ァ-ヶー\s　]+$/, "フリガナはカタカナで入力してください"),
  dateOfBirth: z
    .string()
    .min(1, "生年月日は必須です")
    .regex(
      /^(明治|大正|昭和|平成|令和)\d+年\d{1,2}月\d{1,2}日$/,
      "生年月日は和暦（例: 昭和40年3月15日）で入力してください"
    ),
  gender: GenderSchema,
  postalCode: z
    .string()
    .regex(/^\d{3}-\d{4}$/, "郵便番号は XXX-XXXX 形式で入力してください")
    .optional()
    .or(z.literal("")),
  address: z.string().min(1, "住所は必須です"),
  addressDetail: z.string().optional().default(""),
  mailingNumber: z.string().min(1, "宛名番号は必須です"),
  householdNumber: z.string().min(1, "世帯番号は必須です"),
  sealName: z.string().min(1, "印影名（姓）は必須です"),
  sealNameCategory: SealNameCategorySchema,
  registrationMethod: RegistrationMethodSchema.default("即時"),
});

export const UpdateStatusSchema = z.object({
  status: SealRegistrationStatusSchema,
});

export const SearchQuerySchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  address: z.string().optional(),
});

export type CreateRegistrationInput = z.infer<typeof CreateRegistrationSchema>;
export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
