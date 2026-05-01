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

  test("reads left file spec from query params", () => {
    mocks.searchParams = new URLSearchParams({
      lo: "octocat",
      lr: "Hello-World",
      lref: "main",
      lp: "README.md",
    });

    const { result } = renderHook(() => useQueryParams());
    expect(result.current.state.left).toEqual({
      owner: "octocat",
      repo: "Hello-World",
      ref: "main",
      path: "README.md",
    });
  });

  test("reads right file spec from query params", () => {
    mocks.searchParams = new URLSearchParams({
      ro: "owner2",
      rr: "repo2",
      rref: "develop",
      rp: "src/index.ts",
    });

    const { result } = renderHook(() => useQueryParams());
    expect(result.current.state.right).toEqual({
      owner: "owner2",
      repo: "repo2",
      ref: "develop",
      path: "src/index.ts",
    });
  });

  test("parses branch name with slash correctly", () => {
    mocks.searchParams = new URLSearchParams({
      lo: "octocat",
      lr: "Hello-World",
      lref: "feature/my-branch",
      lp: "src/index.ts",
    });

    const { result } = renderHook(() => useQueryParams());
    expect(result.current.state.left.ref).toBe("feature/my-branch");
    expect(result.current.state.left.path).toBe("src/index.ts");
  });

  test("update calls router.replace with split params", () => {
    const { result } = renderHook(() => useQueryParams());

    act(() => {
      result.current.update({
        left: { owner: "octocat", repo: "Hello-World", ref: "main", path: "README.md" },
      });
    });

    expect(mocks.replace).toHaveBeenCalledTimes(1);
    const url = mocks.replace.mock.calls[0][0] as string;
    expect(url).toContain("lo=octocat");
    expect(url).toContain("lr=Hello-World");
    expect(url).toContain("lref=main");
    expect(url).toContain("lp=README.md");
  });

  test("update sets split params for branch name with slash", () => {
    const { result } = renderHook(() => useQueryParams());

    act(() => {
      result.current.update({
        left: {
          owner: "octocat",
          repo: "Hello-World",
          ref: "feature/my-branch",
          path: "src/index.ts",
        },
      });
    });

    const url = mocks.replace.mock.calls[0][0] as string;
    expect(url).toContain("lref=feature%2Fmy-branch");
    expect(url).toContain("lp=src%2Findex.ts");
  });

  test("update merges partial state", () => {
    mocks.searchParams = new URLSearchParams({
      lo: "existing",
      lr: "repo",
      lref: "main",
      lp: "file.ts",
    });

    const { result } = renderHook(() => useQueryParams());

    act(() => {
      result.current.update({
        right: { owner: "new-owner", repo: "new-repo", ref: "dev", path: "app.ts" },
      });
    });

    const url = mocks.replace.mock.calls[0][0] as string;
    const params = new URL(url, "http://localhost").searchParams;
    expect(params.get("lo")).toBe("existing");
    expect(params.get("lr")).toBe("repo");
    expect(params.get("lref")).toBe("main");
    expect(params.get("lp")).toBe("file.ts");
    expect(params.get("ro")).toBe("new-owner");
    expect(params.get("rr")).toBe("new-repo");
    expect(params.get("rref")).toBe("dev");
    expect(params.get("rp")).toBe("app.ts");
  });

  test("omits params when spec is incomplete", () => {
    const { result } = renderHook(() => useQueryParams());

    act(() => {
      result.current.update({
        left: { owner: "octocat", repo: "Hello-World", ref: "", path: "" },
      });
    });

    const url = mocks.replace.mock.calls[0][0] as string;
    expect(url).not.toContain("lo=");
  });
});
