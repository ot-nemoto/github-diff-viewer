import { act, renderHook } from "@testing-library/react";
import { useQueryParams } from "./useQueryParams";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => mocks.searchParams,
}));

describe("useQueryParams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.searchParams = new URLSearchParams();
  });

  test("returns empty state when no query params", () => {
    const { result } = renderHook(() => useQueryParams());
    expect(result.current.state.left.owner).toBe("");
    expect(result.current.state.left.repo).toBe("");
    expect(result.current.state.right.owner).toBe("");
  });

  test("reads left file spec from query string", () => {
    mocks.searchParams = new URLSearchParams({
      left: "octocat/Hello-World/blob/main/README.md",
    });

    const { result } = renderHook(() => useQueryParams());
    expect(result.current.state.left).toEqual({
      owner: "octocat",
      repo: "Hello-World",
      ref: "main",
      path: "README.md",
    });
  });

  test("reads right file spec from query string", () => {
    mocks.searchParams = new URLSearchParams({
      right: "owner2/repo2/blob/develop/src/index.ts",
    });

    const { result } = renderHook(() => useQueryParams());
    expect(result.current.state.right).toEqual({
      owner: "owner2",
      repo: "repo2",
      ref: "develop",
      path: "src/index.ts",
    });
  });

  test("parses nested path correctly", () => {
    mocks.searchParams = new URLSearchParams({
      left: "octocat/Hello-World/blob/main/src/utils/index.ts",
    });

    const { result } = renderHook(() => useQueryParams());
    expect(result.current.state.left.path).toBe("src/utils/index.ts");
  });

  test("update calls router.replace with GitHub-like URL params", () => {
    const { result } = renderHook(() => useQueryParams());

    act(() => {
      result.current.update({
        left: { owner: "octocat", repo: "Hello-World", ref: "main", path: "README.md" },
      });
    });

    expect(mocks.replace).toHaveBeenCalledTimes(1);
    const url = mocks.replace.mock.calls[0][0] as string;
    expect(url).toContain("left=octocat%2FHello-World%2Fblob%2Fmain%2FREADME.md");
  });

  test("update merges partial state", () => {
    mocks.searchParams = new URLSearchParams({
      left: "existing/repo/blob/main/file.ts",
    });

    const { result } = renderHook(() => useQueryParams());

    act(() => {
      result.current.update({
        right: { owner: "new-owner", repo: "new-repo", ref: "dev", path: "app.ts" },
      });
    });

    const url = mocks.replace.mock.calls[0][0] as string;
    expect(url).toContain("left=");
    expect(url).toContain("right=");
    expect(url).toContain("new-owner");
  });

  test("omits param when spec is incomplete", () => {
    const { result } = renderHook(() => useQueryParams());

    act(() => {
      result.current.update({
        left: { owner: "octocat", repo: "Hello-World", ref: "", path: "" },
      });
    });

    const url = mocks.replace.mock.calls[0][0] as string;
    expect(url).not.toContain("left=");
  });
});
