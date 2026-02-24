import { useRef, useState } from "react";
import { Link, redirect, useActionData, useNavigation, useSubmit } from "react-router";
import { SealPreview } from "../../components/SealPreview";
import { apiClient } from "../../lib/api";
import {
  type Gender,
  type RegistrationMethod,
  SEAL_NAME_CATEGORIES,
  type SealNameCategory,
} from "../../lib/types";
import type { Route } from "./+types/new";

export function meta(_args: Route.MetaArgs) {
  return [{ title: "新規印鑑登録 - 印鑑登録証明システム" }];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const name = (formData.get("name") as string)?.trim() ?? "";
  const nameKana = (formData.get("nameKana") as string)?.trim() ?? "";
  const era = (formData.get("dateOfBirthEra") as string) ?? "昭和";
  const year = (formData.get("dateOfBirthYear") as string) ?? "";
  const month = (formData.get("dateOfBirthMonth") as string) ?? "";
  const day = (formData.get("dateOfBirthDay") as string) ?? "";
  const dateOfBirth = `${era}${year}年${month}月${day}日`;
  const sealName = name.split(/[\s　]/)[0] ?? name;

  const sealImageFile = formData.get("sealImage");
  const sealNameCategory = ((formData.get("sealNameCategory") as string) ??
    "氏名") as SealNameCategory;
  const registrationMethod = ((formData.get("registrationMethod") as string) ??
    "即時") as RegistrationMethod;

  try {
    const newReg = await apiClient.create(
      {
        name,
        nameKana,
        dateOfBirth,
        gender: (formData.get("gender") as Gender) ?? "男",
        postalCode: (formData.get("postalCode") as string) ?? "",
        address: (formData.get("address") as string)?.trim() ?? "",
        addressDetail: (formData.get("addressDetail") as string)?.trim() ?? "",
        mailingNumber: (formData.get("mailingNumber") as string)?.trim() ?? "",
        householdNumber: (formData.get("householdNumber") as string)?.trim() ?? "",
        sealName,
        sealNameCategory,
        registrationMethod,
      },
      sealImageFile instanceof File && sealImageFile.size > 0 ? sealImageFile : undefined
    );
    return redirect(`/registrations/${newReg.id}`);
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "登録に失敗しました",
    };
  }
}

type FormState = {
  name: string;
  nameKana: string;
  dateOfBirthEra: string;
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
};

const INITIAL_FORM: FormState = {
  name: "",
  nameKana: "",
  dateOfBirthEra: "昭和",
  dateOfBirthYear: "",
  dateOfBirthMonth: "",
  dateOfBirthDay: "",
  gender: "男",
  postalCode: "",
  address: "",
  addressDetail: "",
  mailingNumber: "",
  householdNumber: "",
  sealNameCategory: "氏名",
  registrationMethod: "即時",
};

const ERA_OPTIONS = ["明治", "大正", "昭和", "平成", "令和"] as const;

export default function NewRegistration() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  // 印影画像プレビュー（クライアントサイドのみ、actionには formRef 経由で送信）
  const [sealImagePreviewUrl, setSealImagePreviewUrl] = useState<string | null>(null);

  const isSubmitting = navigation.state !== "idle";
  const familyName = form.name.split(/[\s　]/)[0] ?? form.name;

  const handleChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSealImagePreviewUrl(url);
  };

  const handleImageRemove = () => {
    setSealImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) newErrors.name = "氏名は必須です";
    if (!form.nameKana.trim()) newErrors.nameKana = "フリガナは必須です";
    if (!form.dateOfBirthYear) newErrors.dateOfBirthYear = "生年月日を入力してください";
    if (!form.dateOfBirthMonth) newErrors.dateOfBirthMonth = "月を入力してください";
    if (!form.dateOfBirthDay) newErrors.dateOfBirthDay = "日を入力してください";
    if (!form.address.trim()) newErrors.address = "住所は必須です";
    if (!form.mailingNumber.trim()) newErrors.mailingNumber = "宛名番号は必須です";
    if (!form.householdNumber.trim()) newErrors.householdNumber = "世帯番号は必須です";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setShowConfirm(true);
    }
  };

  const handleConfirmRegister = () => {
    if (formRef.current) {
      // フォーム要素全体を送信（ファイル入力も含む）、actionが処理する
      submit(formRef.current, { method: "post", encType: "multipart/form-data" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-800 text-white shadow">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wide">印鑑登録証明システム</h1>
          <Link to="/" className="text-sm text-red-200 hover:text-white">
            ← 一覧に戻る
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">新規印鑑登録</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* 印影プレビュー */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center gap-3">
            <h3 className="text-sm font-semibold text-gray-500">印影プレビュー</h3>
            <SealPreview
              familyName={familyName || "印"}
              size={100}
              imageUrl={sealImagePreviewUrl ?? undefined}
            />
            <p className="text-xs text-gray-400 text-center">
              {sealImagePreviewUrl
                ? "アップロード画像"
                : familyName
                  ? `「${familyName}」印`
                  : "氏名を入力すると表示されます"}
            </p>

            {/* 画像アップロードエリア */}
            <div className="w-full mt-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                印影画像（任意）
              </label>
              <input
                ref={fileInputRef}
                type="file"
                name="sealImage"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              />
              {sealImagePreviewUrl && (
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className="mt-1 text-xs text-gray-400 hover:text-red-600 underline"
                >
                  画像を削除
                </button>
              )}
              <p className="text-xs text-gray-400 mt-1">JPEG / PNG / GIF / WebP、5MB以下</p>
            </div>
          </div>

          {/* フォーム */}
          <div className="md:col-span-2">
            {/*
              フォームのsubmitはonSubmitで横取りし確認ダイアログを表示する。
              "登録する"ボタン押下時にuseSubmit(formRef.current)でactionへ送信。
              name属性が各inputに付いていることが重要（FormData構築に使われる）。
            */}
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow p-6 space-y-5"
            >
              {/* 氏名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  氏名 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="例: 山田 太郎"
                  className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.name ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* フリガナ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  フリガナ <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="nameKana"
                  value={form.nameKana}
                  onChange={handleChange("nameKana")}
                  placeholder="例: ヤマダ タロウ"
                  className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.nameKana ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.nameKana && <p className="text-red-500 text-xs mt-1">{errors.nameKana}</p>}
              </div>

              {/* 生年月日 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  生年月日（和暦） <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-2 items-center flex-wrap">
                  <select
                    name="dateOfBirthEra"
                    value={form.dateOfBirthEra}
                    onChange={handleChange("dateOfBirthEra")}
                    className="border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {ERA_OPTIONS.map((era) => (
                      <option key={era} value={era}>
                        {era}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="dateOfBirthYear"
                    value={form.dateOfBirthYear}
                    onChange={handleChange("dateOfBirthYear")}
                    placeholder="年"
                    min="1"
                    max="99"
                    className={`w-16 border rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.dateOfBirthYear ? "border-red-500" : "border-gray-300"}`}
                  />
                  <span className="text-sm text-gray-600">年</span>
                  <input
                    type="number"
                    name="dateOfBirthMonth"
                    value={form.dateOfBirthMonth}
                    onChange={handleChange("dateOfBirthMonth")}
                    placeholder="月"
                    min="1"
                    max="12"
                    className={`w-14 border rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.dateOfBirthMonth ? "border-red-500" : "border-gray-300"}`}
                  />
                  <span className="text-sm text-gray-600">月</span>
                  <input
                    type="number"
                    name="dateOfBirthDay"
                    value={form.dateOfBirthDay}
                    onChange={handleChange("dateOfBirthDay")}
                    placeholder="日"
                    min="1"
                    max="31"
                    className={`w-14 border rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.dateOfBirthDay ? "border-red-500" : "border-gray-300"}`}
                  />
                  <span className="text-sm text-gray-600">日</span>
                </div>
              </div>

              {/* 性別 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
                <div className="flex gap-4">
                  {(["男", "女"] as Gender[]).map((g) => (
                    <label key={g} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={form.gender === g}
                        onChange={handleChange("gender")}
                        className="accent-red-700"
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </div>

              {/* 郵便番号 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">郵便番号</label>
                <input
                  type="text"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange("postalCode")}
                  placeholder="例: 100-0001"
                  className="w-40 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* 住所 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  住所 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange("address")}
                  placeholder="例: 東京都千代田区霞が関一丁目1番1号"
                  className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.address ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              {/* 方書 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  方書（建物名など）
                </label>
                <input
                  type="text"
                  name="addressDetail"
                  value={form.addressDetail}
                  onChange={handleChange("addressDetail")}
                  placeholder="例: ○○マンション201号"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* 宛名番号・世帯番号 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    宛名番号 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="mailingNumber"
                    value={form.mailingNumber}
                    onChange={handleChange("mailingNumber")}
                    placeholder="例: 1000099"
                    className={`w-full border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.mailingNumber ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.mailingNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.mailingNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    世帯番号 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="householdNumber"
                    value={form.householdNumber}
                    onChange={handleChange("householdNumber")}
                    placeholder="例: 2000099"
                    className={`w-full border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.householdNumber ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.householdNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.householdNumber}</p>
                  )}
                </div>
              </div>

              {/* 印影の氏名区分 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  印影の氏名区分 <span className="text-red-600">*</span>
                </label>
                <select
                  name="sealNameCategory"
                  value={form.sealNameCategory}
                  onChange={handleChange("sealNameCategory")}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {SEAL_NAME_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {form.sealNameCategory === "その他" && (
                  <p className="text-amber-600 text-xs mt-1">
                    「その他」を選択した場合はメモに詳細を記載してください
                  </p>
                )}
              </div>

              {/* 登録方法 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  登録方法 <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-6">
                  {(["即時", "照会"] as RegistrationMethod[]).map((method) => (
                    <label key={method} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="registrationMethod"
                        value={method}
                        checked={form.registrationMethod === method}
                        onChange={handleChange("registrationMethod")}
                        className="accent-red-700"
                      />
                      <span>{method === "即時" ? "即時登録" : "照会書発行（後日回答）"}</span>
                    </label>
                  ))}
                </div>
                {form.registrationMethod === "照会" && (
                  <p className="text-amber-600 text-xs mt-1">
                    照会書を住民票上の住所へ郵送します。回答後に正式登録となります
                  </p>
                )}
              </div>

              {/* 送信ボタン */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-red-800 text-white px-8 py-2.5 rounded font-medium text-sm hover:bg-red-700 transition"
                >
                  登録内容を確認
                </button>
                <Link
                  to="/"
                  className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded font-medium text-sm hover:bg-gray-300 transition"
                >
                  キャンセル
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* 登録確認ダイアログ */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h4 className="text-lg font-bold text-gray-800 mb-4">登録内容の確認</h4>
              <dl className="text-sm space-y-2">
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-gray-500">氏名</dt>
                  <dd className="font-medium">{form.name}</dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-gray-500">フリガナ</dt>
                  <dd>{form.nameKana}</dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-gray-500">生年月日</dt>
                  <dd>
                    {form.dateOfBirthEra}
                    {form.dateOfBirthYear}年{form.dateOfBirthMonth}月{form.dateOfBirthDay}日
                  </dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-gray-500">性別</dt>
                  <dd>{form.gender}</dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-gray-500">住所</dt>
                  <dd className="text-right max-w-xs">
                    {form.address}
                    {form.addressDetail && ` ${form.addressDetail}`}
                  </dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-gray-500">印影区分</dt>
                  <dd>{form.sealNameCategory}</dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-gray-500">登録方法</dt>
                  <dd>{form.registrationMethod === "即時" ? "即時登録" : "照会書発行"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">印影</dt>
                  <dd>
                    <SealPreview
                      familyName={familyName}
                      size={40}
                      imageUrl={sealImagePreviewUrl ?? undefined}
                    />
                  </dd>
                </div>
              </dl>

              {/* actionから返ったエラー表示 */}
              {actionData?.error && <p className="mt-3 text-sm text-red-600">{actionData.error}</p>}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleConfirmRegister}
                  disabled={isSubmitting}
                  className="flex-1 bg-red-800 text-white py-2.5 rounded font-medium text-sm hover:bg-red-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? "登録中..." : "登録する"}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded font-medium text-sm hover:bg-gray-300 transition disabled:opacity-50"
                >
                  修正する
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
