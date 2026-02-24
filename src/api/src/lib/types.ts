export type SealRegistrationStatus = "照会中" | "照会取消" | "登録" | "抹消";
export type Gender = "男" | "女";

export interface SealRegistration {
  id: string;
  name: string;
  nameKana: string;
  dateOfBirth: string;
  gender: Gender;
  address: string;
  addressDetail: string;
  postalCode: string;
  mailingNumber: string;
  householdNumber: string;
  registrationDate: string;
  status: SealRegistrationStatus;
  sealName: string;
  sealImageBase64?: string;
}
