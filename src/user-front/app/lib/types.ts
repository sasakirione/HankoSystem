export type SealRegistrationStatus = "照会中" | "照会取消" | "登録" | "抹消";

export type Gender = "男" | "女";

export interface SealRegistration {
  id: string; // 登録番号
  name: string; // 氏名
  nameKana: string; // 振り仮名
  dateOfBirth: string; // 生年月日 (和暦文字列 例: "昭和40年3月15日")
  gender: Gender;
  address: string; // 住所
  addressDetail: string; // 方書
  postalCode: string;
  mailingNumber: string; // 宛名番号
  householdNumber: string; // 世帯番号
  registrationDate: string; // 登録年月日 (ISO date)
  status: SealRegistrationStatus;
  sealName: string; // 印影に使用する氏名（姓）
  sealImageBase64?: string; // アップロードされた印影画像（data URL形式）
}

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
}
