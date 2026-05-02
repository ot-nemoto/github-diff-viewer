"use client";

import { useEffect, useRef, useState } from "react";
import { type GitHubError, validateToken } from "@/lib/github";
import { clearToken, getToken, setToken } from "@/lib/storage";

type ValidationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; login: string }
  | { status: "error"; message: string };

export function TokenSettings() {
  const [hasToken, setHasToken] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [input, setInput] = useState("");
  const [validation, setValidation] = useState<ValidationState>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasToken(!!getToken());
  }, []);

  useEffect(() => {
    if (showModal) {
      setInput(getToken() ?? "");
      setValidation({ status: "idle" });
      inputRef.current?.focus();
    }
  }, [showModal]);

  const handleVerify = async () => {
    if (!input.trim()) return;
    setValidation({ status: "loading" });
    try {
      const { login } = await validateToken(input.trim());
      setToken(input.trim());
      setHasToken(true);
      setValidation({ status: "success", login });
    } catch (e) {
      const message = (e as GitHubError).message ?? "トークンの検証に失敗しました";
      setValidation({ status: "error", message });
    }
  };

  const handleDelete = () => {
    clearToken();
    setHasToken(false);
    setInput("");
    setValidation({ status: "idle" });
    setShowModal(false);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const isVerifying = validation.status === "loading";

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="bg-white border border-[#d0d7de] rounded-md text-sm px-3 py-1 text-[#1f2328] hover:bg-[#f6f8fa] transition-colors"
      >
        設定
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 cursor-pointer"
            onClick={handleClose}
            aria-label="モーダルを閉じる"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pat-modal-title"
            className="relative bg-[#f6f8fa] rounded-lg w-full max-w-2xl mx-4 shadow-xl border border-[#d0d7de]"
          >
            <div className="px-5 py-4 border-b border-[#d0d7de] flex justify-between items-center">
              <h2 id="pat-modal-title" className="text-base font-semibold text-[#1f2328]">
                設定
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="text-[#636c76] hover:text-[#1f2328] transition-colors"
                aria-label="設定を閉じる"
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
            <div className="p-5 space-y-4">
              <div className="bg-white rounded-md border border-[#d0d7de] p-5">
                <p className="text-sm font-semibold text-[#1f2328] mb-3">GitHub Token</p>
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="password"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleVerify();
                      if (e.key === "Escape") handleClose();
                    }}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="flex-1 px-3 py-1.5 border border-[#d0d7de] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0969da] focus:border-[#0969da]"
                  />
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={!input.trim() || isVerifying}
                    className="px-4 py-1.5 bg-[#0969da] text-white rounded-md text-sm font-semibold hover:bg-[#0860ca] disabled:opacity-50 disabled:cursor-not-allowed border border-black/10 transition-colors"
                  >
                    {isVerifying ? "検証中..." : "検証"}
                  </button>
                  {hasToken && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-4 py-1.5 bg-white text-[#cf222e] rounded-md text-sm font-semibold hover:bg-[#ffebe9] hover:border-[#cf222e] border border-[#d0d7de] transition-colors"
                    >
                      削除
                    </button>
                  )}
                </div>
                {validation.status === "success" && (
                  <p className="mt-2 text-sm text-[#1a7f37]">
                    ✓ @{validation.login} として認証済み
                  </p>
                )}
                {validation.status === "error" && (
                  <p className="mt-2 text-sm text-[#cf222e]">✗ {validation.message}</p>
                )}
                <p className="mt-3 text-xs text-[#636c76] leading-relaxed">
                  Classic PAT（スコープ:{" "}
                  <code className="bg-[#f6f8fa] border border-[#d0d7de] rounded px-1">repo</code>
                  ）を使用してください。プライベートリポジトリへのアクセスに必要です。パブリックリポジトリのみの場合は不要です。{" "}
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0969da]"
                  >
                    トークンを発行する →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
