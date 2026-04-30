"use client";

import { useEffect, useState } from "react";
import { clearToken, getToken, setToken } from "@/lib/storage";

export function TokenSettings() {
  const [hasToken, setHasToken] = useState(false);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setHasToken(!!getToken());
  }, []);

  const handleSave = () => {
    if (!input.trim()) return;
    setToken(input.trim());
    setHasToken(true);
    setInput("");
    setOpen(false);
  };

  const handleClear = () => {
    clearToken();
    setHasToken(false);
  };

  return (
    <div className="flex items-center gap-2">
      {hasToken ? (
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          トークンをクリア
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          トークンを設定
        </button>
      )}

      {open && !hasToken && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="GitHub Personal Access Token"
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              保存
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Classic PAT（スコープ: <code className="bg-gray-100 px-1 rounded">repo</code>）を使用してください。
            プライベートリポジトリへのアクセスに必要です。パブリックリポジトリのみの場合は不要です。
            <a
              href="https://github.com/settings/tokens/new?scopes=repo"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-blue-600 hover:underline"
            >
              トークンを発行する →
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
