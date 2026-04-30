import { fetchFileContent, fetchRefs, fetchTree } from "./github";

const mockGetContent = vi.hoisted(() => vi.fn());
const mockListBranches = vi.hoisted(() => vi.fn());
const mockListTags = vi.hoisted(() => vi.fn());
const mockGetTree = vi.hoisted(() => vi.fn());

vi.mock("@octokit/rest", () => ({
  // biome-ignore lint/complexity/useArrowFunction: arrow function cannot be used with `new`
  Octokit: vi.fn().mockImplementation(function () {
    return {
      repos: {
        getContent: mockGetContent,
        listBranches: mockListBranches,
        listTags: mockListTags,
      },
      git: {
        getTree: mockGetTree,
      },
    };
  }),
}));

describe("fetchFileContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns decoded file content on success", async () => {
    const original = "Hello, World!";
    mockGetContent.mockResolvedValue({
      data: { type: "file", content: btoa(original), sha: "abc123" },
    });

    const result = await fetchFileContent({
      owner: "octocat",
      repo: "Hello-World",
      ref: "main",
      path: "README.md",
    });

    expect(result.content).toBe(original);
    expect(result.sha).toBe("abc123");
  });

  test("passes token to Octokit", async () => {
    const { Octokit } = await import("@octokit/rest");
    mockGetContent.mockResolvedValue({
      data: { type: "file", content: btoa("content"), sha: "abc" },
    });

    await fetchFileContent({
      owner: "octocat",
      repo: "private-repo",
      ref: "main",
      path: "README.md",
      token: "ghp_secret",
    });

    expect(vi.mocked(Octokit)).toHaveBeenCalledWith({ auth: "ghp_secret" });
  });

  test("throws GitHubError with status 404 on not found", async () => {
    mockGetContent.mockRejectedValue({ status: 404 });

    await expect(
      fetchFileContent({ owner: "octocat", repo: "nonexistent", ref: "main", path: "README.md" }),
    ).rejects.toMatchObject({ status: 404, message: "リポジトリまたはファイルが見つかりません" });
  });

  test("throws GitHubError with status 401 on unauthorized", async () => {
    mockGetContent.mockRejectedValue({ status: 401 });

    await expect(
      fetchFileContent({ owner: "octocat", repo: "private", ref: "main", path: "README.md" }),
    ).rejects.toMatchObject({ status: 401, message: "プライベートリポジトリには PAT が必要です" });
  });

  test("throws GitHubError with status 403 on forbidden", async () => {
    mockGetContent.mockRejectedValue({ status: 403, response: { headers: {} } });

    await expect(
      fetchFileContent({ owner: "octocat", repo: "private", ref: "main", path: "README.md" }),
    ).rejects.toMatchObject({ status: 403, message: "プライベートリポジトリには PAT が必要です" });
  });

  test("throws rate limit error on 403 with x-ratelimit-remaining: 0", async () => {
    mockGetContent.mockRejectedValue({
      status: 403,
      response: { headers: { "x-ratelimit-remaining": "0" } },
    });

    await expect(
      fetchFileContent({ owner: "octocat", repo: "Hello-World", ref: "main", path: "README.md" }),
    ).rejects.toMatchObject({
      message: "API レート制限に達しました。PAT を入力するか、しばらく待ってください",
    });
  });

  test("throws GitHubError when path points to a directory", async () => {
    mockGetContent.mockResolvedValue({ data: [{ type: "file", name: "README.md" }] });

    await expect(
      fetchFileContent({ owner: "octocat", repo: "Hello-World", ref: "main", path: "src" }),
    ).rejects.toMatchObject({ message: "指定されたパスはファイルではありません" });
  });
});

describe("fetchRefs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns branches and tags", async () => {
    mockListBranches.mockResolvedValue({ data: [{ name: "main" }, { name: "develop" }] });
    mockListTags.mockResolvedValue({ data: [{ name: "v1.0.0" }, { name: "v1.1.0" }] });

    const result = await fetchRefs({ owner: "octocat", repo: "Hello-World" });

    expect(result.branches).toEqual(["main", "develop"]);
    expect(result.tags).toEqual(["v1.0.0", "v1.1.0"]);
  });

  test("returns empty arrays when both requests fail", async () => {
    mockListBranches.mockRejectedValue(new Error("404"));
    mockListTags.mockRejectedValue(new Error("404"));

    const result = await fetchRefs({ owner: "octocat", repo: "nonexistent" });

    expect(result.branches).toEqual([]);
    expect(result.tags).toEqual([]);
  });

  test("returns branches even if tags request fails", async () => {
    mockListBranches.mockResolvedValue({ data: [{ name: "main" }] });
    mockListTags.mockRejectedValue(new Error("404"));

    const result = await fetchRefs({ owner: "octocat", repo: "Hello-World" });

    expect(result.branches).toEqual(["main"]);
    expect(result.tags).toEqual([]);
  });

  test("passes token to Octokit", async () => {
    const { Octokit } = await import("@octokit/rest");
    mockListBranches.mockResolvedValue({ data: [] });
    mockListTags.mockResolvedValue({ data: [] });

    await fetchRefs({ owner: "octocat", repo: "private-repo", token: "ghp_secret" });

    expect(vi.mocked(Octokit)).toHaveBeenCalledWith({ auth: "ghp_secret" });
  });
});

describe("fetchTree", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns file paths from tree", async () => {
    mockGetTree.mockResolvedValue({
      data: {
        tree: [
          { type: "blob", path: "README.md" },
          { type: "blob", path: "src/index.ts" },
          { type: "tree", path: "src" },
        ],
      },
    });

    const result = await fetchTree({ owner: "octocat", repo: "Hello-World", ref: "main" });

    expect(result).toEqual(["README.md", "src/index.ts"]);
  });

  test("returns empty array on API error", async () => {
    mockGetTree.mockRejectedValue(new Error("404"));

    const result = await fetchTree({ owner: "octocat", repo: "nonexistent", ref: "main" });

    expect(result).toEqual([]);
  });

  test("excludes tree entries, includes only blobs", async () => {
    mockGetTree.mockResolvedValue({
      data: {
        tree: [
          { type: "tree", path: "src" },
          { type: "blob", path: "src/app.ts" },
          { type: "commit", path: ".gitmodules" },
        ],
      },
    });

    const result = await fetchTree({ owner: "octocat", repo: "Hello-World", ref: "main" });

    expect(result).toEqual(["src/app.ts"]);
  });
});
