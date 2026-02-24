import type { CreateRegistrationInput } from "./schemas";
import type { SealRegistration } from "./types";

let registrations: SealRegistration[] = [
  {
    id: "internal-001",
    registrationNumber: "20240001",
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
    sealNameCategory: "氏名",
  },
  {
    id: "internal-002",
    registrationNumber: "20240002",
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
    sealNameCategory: "氏名",
  },
  {
    id: "internal-003",
    registrationNumber: "20230005",
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
    sealNameCategory: "氏名",
  },
  {
    // 照会中: 登録番号・登録年月日は null（仕様書 1.1.3）
    id: "internal-004",
    registrationNumber: null,
    name: "佐藤 美咲",
    nameKana: "サトウ ミサキ",
    dateOfBirth: "令和元年5月1日",
    gender: "女",
    address: "東京都港区芝公園四丁目2番8号",
    addressDetail: "",
    postalCode: "105-8011",
    mailingNumber: "1000004",
    householdNumber: "2000004",
    registrationDate: null,
    status: "照会中",
    sealName: "佐藤",
    sealNameCategory: "氏名",
  },
];

let internalIdCounter = 5;
let registrationNumberCounter = 20250001;

const generateInternalId = (): string => {
  const id = `internal-${String(internalIdCounter).padStart(3, "0")}`;
  internalIdCounter++;
  return id;
};

const generateRegistrationNumber = (): string => {
  const num = String(registrationNumberCounter);
  registrationNumberCounter++;
  return num;
};

export const db = {
  getAll: (): SealRegistration[] => [...registrations],

  getById: (id: string): SealRegistration | undefined => registrations.find((r) => r.id === id),

  search: (query: { id?: string; name?: string; address?: string }): SealRegistration[] =>
    registrations.filter((r) => {
      // 登録番号または内部IDで検索
      if (query.id && !r.id.includes(query.id) && !(r.registrationNumber ?? "").includes(query.id))
        return false;
      if (query.name && !r.name.includes(query.name) && !r.nameKana.includes(query.name))
        return false;
      if (query.address && !r.address.includes(query.address)) return false;
      return true;
    }),

  create: (input: CreateRegistrationInput, sealImageBase64?: string): SealRegistration => {
    const isImmediate = (input.registrationMethod ?? "即時") === "即時";
    const newReg: SealRegistration = {
      ...input,
      addressDetail: input.addressDetail ?? "",
      postalCode: input.postalCode ?? "",
      id: generateInternalId(),
      // 即時登録: 登録番号・登録年月日を付番。照会書発行: どちらも null（仕様書 1.1.3）
      registrationNumber: isImmediate ? generateRegistrationNumber() : null,
      registrationDate: isImmediate ? new Date().toISOString().split("T")[0] : null,
      status: isImmediate ? "登録" : "照会中",
      sealNameCategory: input.sealNameCategory,
      ...(sealImageBase64 ? { sealImageBase64 } : {}),
    };
    registrations = [...registrations, newReg];
    return newReg;
  },

  updateStatus: (id: string, status: SealRegistration["status"]): SealRegistration | undefined => {
    registrations = registrations.map((r) => (r.id === id ? { ...r, status } : r));
    return registrations.find((r) => r.id === id);
  },
};
