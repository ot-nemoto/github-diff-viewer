import { act, renderHook } from "@testing-library/react";
import { fetchFileContent, GitHubError } from "@/lib/github";
import { getToken } from "@/lib/storage";
import { useFileContent } from "./useFileContent";

// fetchFileContent だけモック。GitHubError は実物を使い instanceof が正しく動くようにする
vi.mock("@/lib/github", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/github")>();
  return { ...actual, fetchFileContent: vi.fn() };
});
vi.mock("@/lib/storage");

const mockFetch = vi.mocked(fetchFileContent);
const mockGetToken = vi.mocked(getToken);

const params = { owner: "octocat", repo: "Hello-World", ref: "main", path: "README.md" };

describe("useFileContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockReturnValue(null);
  });

  test("initial state is empty", () => {
    const { result } = renderHook(() => useFileContent());
    expect(result.current.content).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test("sets loading true during fetch", async () => {
    let resolve: (value: { content: string; sha: string }) => void;
    mockFetch.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );

    const { result } = renderHook(() => useFileContent());

    act(() => {
      result.current.fetch(params);
    });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolve?.({ content: "content", sha: "abc" });
    });
    expect(result.current.loading).toBe(false);
  });

  test("sets content on success", async () => {
    mockFetch.mockResolvedValue({ content: "file content", sha: "abc123" });

    const { result } = renderHook(() => useFileContent());
    await act(async () => {
      await result.current.fetch(params);
    });

    expect(result.current.content).toBe("file content");
    expect(result.current.error).toBeNull();
  });

  test("sets error on GitHubError", async () => {
    mockFetch.mockRejectedValue(new GitHubError("リポジトリまたはファイルが見つかりません", 404));

    const { result } = renderHook(() => useFileContent());
    await act(async () => {
      await result.current.fetch(params);
    });

    expect(result.current.content).toBeNull();
    expect(result.current.error).toBe("リポジトリまたはファイルが見つかりません");
  });

  test("sets generic error message on unknown error", async () => {
    mockFetch.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useFileContent());
    await act(async () => {
      await result.current.fetch(params);
    });

    expect(result.current.error).toBe("ファイルの取得に失敗しました");
  });

  test("passes token from storage to fetchFileContent", async () => {
    mockGetToken.mockReturnValue("ghp_my_token");
    mockFetch.mockResolvedValue({ content: "content", sha: "abc" });

    const { result } = renderHook(() => useFileContent());
    await act(async () => {
      await result.current.fetch(params);
    });

    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ token: "ghp_my_token" }));
  });

  test("passes undefined token when storage is empty", async () => {
    mockFetch.mockResolvedValue({ content: "content", sha: "abc" });

    const { result } = renderHook(() => useFileContent());
    await act(async () => {
      await result.current.fetch(params);
    });

    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ token: undefined }));
  });
});
