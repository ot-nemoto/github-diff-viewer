"use client";

import { useEffect, useState } from "react";
import { clearToken, getToken, setToken } from "@/lib/storage";

export function TokenSettings() {
  const [hasToken, setHasToken] = useState(false);
  const [input, setInput] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setHasToken(!!getToken());
  }, []);

  const handleSave = () => {
    if (!input.trim()) return;
    setToken(input.trim());
    setHasToken(true);
    setInput("");
    setShowModal(false);
  };

  const handleClear = () => {
    clearToken();
    setHasToken(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => (hasToken ? handleClear() : setShowModal(true))}
        className="flex items-center gap-1.5 bg-white/[.08] border border-white/15 rounded-md text-sm px-3 py-1.5 hover:bg-white/[.12] transition-colors"
        style={{ color: hasToken ? "#3fb950" : "#e6edf3" }}
      >
        {/* Key icon */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M6.5 0a6.5 6.5 0 0 1 5.25 10.354l3.45 3.449a.75.75 0 1 1-1.06 1.06l-3.45-3.449A6.5 6.5 0 1 1 6.5 0zm0 1.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" />
        </svg>
        {hasToken ? "PAT 設定済み" : "PAT を設定"}
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <button
            type="button"
            className="absolute inset-0 bg-[#010409]/50 cursor-default"
            onClick={() => setShowModal(false)}
            aria-label="モーダルを閉じる"
          />
          <div className="relative bg-white rounded-xl w-[440px] shadow-xl border border-[#d0d7de]">
            <div className="px-4 pt-4 pb-0 flex justify-between items-center">
              <span className="text-base font-semibold text-[#1f2328]">
                GitHub Personal Access Token
              </span>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-[#636c76] hover:text-[#1f2328] transition-colors"
                aria-label="閉じる"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-[#636c76] mb-3 leading-relaxed">
                Classic PAT（スコープ:{" "}
                <code className="bg-[#f6f8fa] border border-[#d0d7de] rounded px-1 text-xs">
                  repo
                </code>
                ）を使用してください。プライベートリポジトリへのアクセスに必要です。パブリックリポジトリのみの場合は不要です。
              </p>
              <input
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") setShowModal(false);
                }}
                placeholder="GitHub Personal Access Token"
                className="w-full px-3 py-2 border border-[#d0d7de] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0969da]/20 focus:border-[#0969da]"
              />
            </div>
            <div className="px-4 pb-4 flex justify-end items-center gap-2">
              <a
                href="https://github.com/settings/tokens/new?scopes=repo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#0969da] mr-auto"
              >
                トークンを発行する →
              </a>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 bg-[#0969da] text-white rounded-md text-sm font-semibold hover:bg-[#0860ca] border border-black/10 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
