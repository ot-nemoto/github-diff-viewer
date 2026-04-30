"use client";

import { useCallback, useState } from "react";
import { GitHubError, fetchFileContent, type FileParams } from "@/lib/github";
import { getToken } from "@/lib/storage";

interface FileState {
  content: string | null;
  loading: boolean;
  error: string | null;
}

export function useFileContent() {
  const [state, setState] = useState<FileState>({
    content: null,
    loading: false,
    error: null,
  });

  const fetch = useCallback(async (params: Omit<FileParams, "token">) => {
    setState({ content: null, loading: true, error: null });
    try {
      const token = getToken() ?? undefined;
      const result = await fetchFileContent({ ...params, token });
      setState({ content: result.content, loading: false, error: null });
      return result.content;
    } catch (error) {
      const message =
        error instanceof GitHubError ? error.message : "ファイルの取得に失敗しました";
      setState({ content: null, loading: false, error: message });
      return null;
    }
  }, []);

  return { ...state, fetch };
}
