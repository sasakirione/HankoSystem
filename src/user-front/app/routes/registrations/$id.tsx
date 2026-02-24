import { useState } from "react";
import { Form, Link, useLoaderData, useNavigation } from "react-router";
import { SealPreview } from "../../components/SealPreview";
import { StatusBadge } from "../../components/StatusBadge";
import { apiClient } from "../../lib/api";
import { formatToWareki } from "../../lib/date";
import type { Route } from "./+types/$id";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `登録詳細 ${params.id} - 印鑑登録証明システム` }];
}

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const registration = await apiClient.getById(params.id!);
    return { registration, error: null };
  } catch (e) {
    return {
      registration: null,
      error: e instanceof Error ? e.message : "取得に失敗しました",
    };
  }
}

export async function action({ params, request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "cancel") {
    await apiClient.updateStatus(params.id!, "抹消");
    // loaderが自動的にrevalidateされ、最新のregistrationデータを返す
    return null;
  }

  return null;
}

export default function RegistrationDetail() {
  const { registration: reg, error } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  const isSubmitting = navigation.state !== "idle";

  if (error || !reg) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error ?? "記録が見つかりません"}</p>
          <Link to="/" className="text-red-700 hover:underline">
            ← 一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const isActive = reg.status === "登録";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-800 text-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wide">印鑑登録証明システム</h1>
          <Link to="/" className="text-sm text-red-200 hover:text-white">
            ← 一覧に戻る
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* タイトル行 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">印鑑登録原票</h2>
          <StatusBadge status={reg.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 印影カード */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center gap-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">印影</h3>
            <SealPreview familyName={reg.sealName} size={120} imageUrl={reg.sealImageBase64} />
            <p className="text-xs text-gray-400 mt-1">
              登録番号: {reg.registrationNumber ?? "未付番"}
            </p>
          </div>

          {/* 基本情報 */}
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              登録者情報
            </h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-gray-500">氏名</dt>
                <dd className="font-medium text-gray-900 mt-0.5">{reg.name}</dd>
                <dd className="text-xs text-gray-400">{reg.nameKana}</dd>
              </div>
              <div>
                <dt className="text-gray-500">生年月日</dt>
                <dd className="font-medium text-gray-900 mt-0.5">{reg.dateOfBirth}</dd>
              </div>
              <div>
                <dt className="text-gray-500">性別</dt>
                <dd className="font-medium text-gray-900 mt-0.5">{reg.gender}</dd>
              </div>
              <div>
                <dt className="text-gray-500">登録年月日</dt>
                <dd className="font-medium text-gray-900 mt-0.5">
                  {formatToWareki(reg.registrationDate)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-gray-500">住所</dt>
                <dd className="font-medium text-gray-900 mt-0.5">
                  〒{reg.postalCode} {reg.address}
                  {reg.addressDetail && <span className="text-gray-600"> {reg.addressDetail}</span>}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">宛名番号</dt>
                <dd className="font-mono text-gray-900 mt-0.5">{reg.mailingNumber}</dd>
              </div>
              <div>
                <dt className="text-gray-500">世帯番号</dt>
                <dd className="font-mono text-gray-900 mt-0.5">{reg.householdNumber}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="mt-6 flex gap-3 flex-wrap">
          {isActive && (
            <>
              <button
                onClick={() => setShowCertModal(true)}
                className="bg-red-800 text-white px-6 py-2 rounded font-medium text-sm hover:bg-red-700 transition"
              >
                証明書を発行
              </button>
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="bg-white border border-red-700 text-red-700 px-6 py-2 rounded font-medium text-sm hover:bg-red-50 transition"
              >
                廃止（抹消）
              </button>
            </>
          )}
          <Link
            to="/"
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-medium text-sm hover:bg-gray-300 transition"
          >
            一覧へ戻る
          </Link>
        </div>

        {/*
          廃止確認ダイアログ。
          isActiveがfalse（action後にloaderがrevalidateしてstatus="抹消"になった時点）
          になると自動的に非表示になる。
        */}
        {showCancelConfirm && isActive && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
              <h4 className="text-lg font-bold text-gray-800 mb-2">印鑑登録廃止の確認</h4>
              <p className="text-sm text-gray-600 mb-6">
                {reg.name}
                の印鑑登録を抹消します。この操作は取り消せません。よろしいですか？
              </p>
              <Form method="post" className="flex gap-3">
                <input type="hidden" name="intent" value="cancel" />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-red-700 text-white py-2 rounded font-medium text-sm hover:bg-red-600 transition disabled:opacity-50"
                >
                  {isSubmitting ? "処理中..." : "抹消する"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-medium text-sm hover:bg-gray-300 transition disabled:opacity-50"
                >
                  キャンセル
                </button>
              </Form>
            </div>
          </div>
        )}

        {/* 証明書発行モーダル */}
        {showCertModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full mx-4">
              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-gray-800 mb-1">印鑑登録証明書</h4>
                <p className="text-xs text-gray-400">（印刷プレビュー）</p>
              </div>
              <div className="border-2 border-gray-800 p-6 font-serif">
                <div className="text-center mb-4">
                  <h5 className="text-lg font-bold">印　鑑　登　録　証　明　書</h5>
                </div>
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    <tr className="border border-gray-600">
                      <th className="border border-gray-600 px-3 py-2 bg-gray-100 w-1/3">氏　名</th>
                      <td className="border border-gray-600 px-3 py-2">{reg.name}</td>
                    </tr>
                    <tr className="border border-gray-600">
                      <th className="border border-gray-600 px-3 py-2 bg-gray-100">生年月日</th>
                      <td className="border border-gray-600 px-3 py-2">{reg.dateOfBirth}</td>
                    </tr>
                    <tr className="border border-gray-600">
                      <th className="border border-gray-600 px-3 py-2 bg-gray-100">性　別</th>
                      <td className="border border-gray-600 px-3 py-2">{reg.gender}</td>
                    </tr>
                    <tr className="border border-gray-600">
                      <th className="border border-gray-600 px-3 py-2 bg-gray-100">住　所</th>
                      <td className="border border-gray-600 px-3 py-2">
                        {reg.address}
                        {reg.addressDetail && ` ${reg.addressDetail}`}
                      </td>
                    </tr>
                    <tr className="border border-gray-600">
                      <th className="border border-gray-600 px-3 py-2 bg-gray-100">登録番号</th>
                      <td className="border border-gray-600 px-3 py-2">{reg.registrationNumber}</td>
                    </tr>
                    <tr className="border border-gray-600">
                      <th className="border border-gray-600 px-3 py-2 bg-gray-100">印　影</th>
                      <td className="border border-gray-600 px-3 py-2">
                        <SealPreview
                          familyName={reg.sealName}
                          size={60}
                          imageUrl={reg.sealImageBase64}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-4 text-right text-xs text-gray-600">
                  <p>
                    発行日:{" "}
                    {new Date().toLocaleDateString("ja-JP", {
                      era: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p>○○市長　印</p>
                </div>
                <p className="text-xs text-center text-gray-500 mt-3">
                  この証明書は印鑑の登録がされていることを証明するものです。
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-red-800 text-white py-2 rounded font-medium text-sm hover:bg-red-700 transition"
                >
                  印刷する
                </button>
                <button
                  onClick={() => setShowCertModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-medium text-sm hover:bg-gray-300 transition"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
