import { Form, Link, useLoaderData, useNavigate, useSearchParams } from "react-router";
import { SealPreview } from "../components/SealPreview";
import { StatusBadge } from "../components/StatusBadge";
import { apiClient } from "../lib/api";
import { formatToWareki } from "../lib/date";
import type { Route } from "./+types/home";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "印鑑登録証明システム" },
    { name: "description", content: "印鑑登録証明業務システム" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? undefined;
  const name = url.searchParams.get("name") ?? undefined;
  const address = url.searchParams.get("address") ?? undefined;

  const hasFilter = Boolean(id || name || address);
  const registrations = hasFilter
    ? await apiClient.search({ id, name, address })
    : await apiClient.getAll();

  return { registrations, searched: hasFilter, query: { id, name, address } };
}

export default function Home() {
  const navigate = useNavigate();
  const { registrations, searched } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-red-800 text-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wide">印鑑登録証明システム</h1>
          <Link
            to="/registrations/new"
            className="bg-white text-red-800 text-sm font-semibold px-4 py-2 rounded hover:bg-red-50 transition"
          >
            + 新規登録
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 検索フォーム */}
        <section className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">登録者検索</h2>
          {/*
            method="get" でフォームの値がURLクエリパラメータになり、loaderが再実行される。
            key でURL変更時に再マウントして defaultValue を更新する。
          */}
          <Form key={searchParams.toString()} method="get" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">登録番号</label>
                <input
                  type="text"
                  name="id"
                  defaultValue={searchParams.get("id") ?? ""}
                  placeholder="例: 20240001"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  氏名 / フリガナ
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={searchParams.get("name") ?? ""}
                  placeholder="例: 山田 / ヤマダ"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={searchParams.get("address") ?? ""}
                  placeholder="例: 千代田区"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-red-800 text-white px-6 py-2 rounded text-sm font-medium hover:bg-red-700 transition"
              >
                検索
              </button>
              <Link
                to="/"
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded text-sm font-medium hover:bg-gray-300 transition"
              >
                クリア
              </Link>
            </div>
          </Form>
        </section>

        {/* 検索結果 */}
        <section className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {searched ? "検索結果" : "登録者一覧"}
            </h2>
            <span className="text-sm text-gray-500">{registrations.length} 件</span>
          </div>

          {registrations.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              該当する登録者が見つかりませんでした
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">印影</th>
                    <th className="px-4 py-3 text-left">登録番号</th>
                    <th className="px-4 py-3 text-left">氏名</th>
                    <th className="px-4 py-3 text-left">住所</th>
                    <th className="px-4 py-3 text-left">登録年月日</th>
                    <th className="px-4 py-3 text-left">状態</th>
                    <th className="px-4 py-3 text-left"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <SealPreview
                          familyName={reg.sealName}
                          size={40}
                          imageUrl={reg.sealImageBase64}
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-600">
                        {reg.registrationNumber ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{reg.name}</div>
                        <div className="text-xs text-gray-400">{reg.nameKana}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                        {reg.address}
                        {reg.addressDetail && (
                          <span className="text-gray-400"> {reg.addressDetail}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatToWareki(reg.registrationDate)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={reg.status} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/registrations/${reg.id}`)}
                          className="text-red-700 hover:underline text-xs font-medium"
                        >
                          詳細 →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
