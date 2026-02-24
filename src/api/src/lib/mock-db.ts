import type { SealRegistration } from "./types";
import type { CreateRegistrationInput } from "./schemas";

let registrations: SealRegistration[] = [
  {
    id: "20240001",
    name: "山田 太郎",
    nameKana: "ヤマダ タロウ",
    dateOfBirth: "昭和40年3月15日",
    gender: "男",
    address: "東京都千代田区霞が関一丁目1番1号",
    addressDetail: "",
    postalCode: "100-8914",
    mailingNumber: "1000001",
    householdNumber: "2000001",
    registrationDate: "2024-01-15",
    status: "登録",
    sealName: "山田",
  },
  {
    id: "20240002",
    name: "鈴木 花子",
    nameKana: "スズキ ハナコ",
    dateOfBirth: "平成5年7月22日",
    gender: "女",
    address: "東京都渋谷区渋谷二丁目21番1号",
    addressDetail: "〇〇マンション101号",
    postalCode: "150-8010",
    mailingNumber: "1000002",
    householdNumber: "2000002",
    registrationDate: "2024-02-03",
    status: "登録",
    sealName: "鈴木",
  },
  {
    id: "20230005",
    name: "田中 次郎",
    nameKana: "タナカ ジロウ",
    dateOfBirth: "昭和55年11月30日",
    gender: "男",
    address: "東京都新宿区西新宿二丁目8番1号",
    addressDetail: "",
    postalCode: "163-8001",
    mailingNumber: "1000003",
    householdNumber: "2000003",
    registrationDate: "2023-05-10",
    status: "抹消",
    sealName: "田中",
  },
  {
    id: "20240003",
    name: "佐藤 美咲",
    nameKana: "サトウ ミサキ",
    dateOfBirth: "令和元年5月1日",
    gender: "女",
    address: "東京都港区芝公園四丁目2番8号",
    addressDetail: "",
    postalCode: "105-8011",
    mailingNumber: "1000004",
    householdNumber: "2000004",
    registrationDate: "2024-03-20",
    status: "照会中",
    sealName: "佐藤",
  },
];

let idCounter = 20250000 + registrations.length + 1;

const generateId = (): string => {
  const id = String(idCounter);
  idCounter++;
  return id;
};

export const db = {
  getAll: (): SealRegistration[] => [...registrations],

  getById: (id: string): SealRegistration | undefined =>
    registrations.find((r) => r.id === id),

  search: (query: {
    id?: string;
    name?: string;
    address?: string;
  }): SealRegistration[] =>
    registrations.filter((r) => {
      if (query.id && !r.id.includes(query.id)) return false;
      if (
        query.name &&
        !r.name.includes(query.name) &&
        !r.nameKana.includes(query.name)
      )
        return false;
      if (query.address && !r.address.includes(query.address)) return false;
      return true;
    }),

  create: (
    input: CreateRegistrationInput,
    sealImageBase64?: string
  ): SealRegistration => {
    const newReg: SealRegistration = {
      ...input,
      addressDetail: input.addressDetail ?? "",
      postalCode: input.postalCode ?? "",
      id: generateId(),
      registrationDate: new Date().toISOString().split("T")[0],
      status: "登録",
      ...(sealImageBase64 ? { sealImageBase64 } : {}),
    };
    registrations = [...registrations, newReg];
    return newReg;
  },

  updateStatus: (
    id: string,
    status: SealRegistration["status"]
  ): SealRegistration | undefined => {
    registrations = registrations.map((r) =>
      r.id === id ? { ...r, status } : r
    );
    return registrations.find((r) => r.id === id);
  },
};
