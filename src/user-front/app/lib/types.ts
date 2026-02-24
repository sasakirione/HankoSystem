export type SealRegistrationStatus = "照会中" | "照会取消" | "登録" | "抹消";

export type Gender = "男" | "女";

// 仕様書 1.1.4: 印影の氏名区分（日本人）
export type SealNameCategory =
  | "氏名"
  | "氏のみ"
  | "名のみ"
  | "旧氏と名"
  | "旧氏"
  | "氏頭文字と名頭文字"
  | "氏頭文字と名"
  | "氏と名頭文字"
  | "旧氏頭文字と名頭文字"
  | "旧氏頭文字と名"
  | "旧氏と名頭文字"
  | "その他";

export const SEAL_NAME_CATEGORIES: SealNameCategory[] = [
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
];

export interface SealRegistration {
  id: string; // 内部ID（URL用、変更不可）
  registrationNumber: string | null; // 登録番号（照会中・照会取消は null）
  name: string; // 氏名
  nameKana: string; // 振り仮名
  dateOfBirth: string; // 生年月日 (和暦文字列 例: "昭和40年3月15日")
  gender: Gender;
  address: string; // 住所
  addressDetail: string; // 方書
  postalCode: string;
  mailingNumber: string; // 宛名番号
  householdNumber: string; // 世帯番号
  registrationDate: string | null; // 登録年月日 (ISO date)。照会中・照会取消は null
  status: SealRegistrationStatus;
  sealName: string; // 印影に使用する氏名（表示用）
  sealNameCategory: SealNameCategory; // 印影の氏名区分
  sealImageBase64?: string; // アップロードされた印影画像（data URL形式）
}

export type RegistrationMethod = "即時" | "照会";

export interface SealRegistrationFormInput {
  name: string;
  nameKana: string;
  dateOfBirthEra: string; // 元号 (令和/平成/昭和/大正)
  dateOfBirthYear: string;
  dateOfBirthMonth: string;
  dateOfBirthDay: string;
  gender: Gender;
  postalCode: string;
  address: string;
  addressDetail: string;
  mailingNumber: string;
  householdNumber: string;
  sealNameCategory: SealNameCategory;
  registrationMethod: RegistrationMethod;
}
