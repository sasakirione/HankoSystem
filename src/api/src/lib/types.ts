export type SealRegistrationStatus = "照会中" | "照会取消" | "登録" | "抹消";
export type Gender = "男" | "女";
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
export type RegistrationMethod = "即時" | "照会";

export interface SealRegistration {
  id: string; // 内部ID
  registrationNumber: string | null; // 登録番号（照会中・照会取消はnull）
  name: string;
  nameKana: string;
  dateOfBirth: string;
  gender: Gender;
  address: string;
  addressDetail: string;
  postalCode: string;
  mailingNumber: string;
  householdNumber: string;
  registrationDate: string | null; // 照会中・照会取消はnull
  status: SealRegistrationStatus;
  sealName: string;
  sealNameCategory: SealNameCategory;
  sealImageBase64?: string;
}
