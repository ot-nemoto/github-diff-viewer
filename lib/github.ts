import { Octokit } from "@octokit/rest";

export interface FileParams {
  owner: string;
  repo: string;
  ref: string;
  path: string;
  token?: string;
}

export interface FileResult {
  content: string;
  sha: string;
}

export class GitHubError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

export interface RefsResult {
  branches: string[];
  tags: string[];
}

export async function fetchRefs(
  params: Pick<FileParams, "owner" | "repo" | "token">,
): Promise<RefsResult> {
  const { owner, repo, token } = params;
  const octokit = new Octokit({ auth: token });
  const [branchesRes, tagsRes] = await Promise.allSettled([
    octokit.repos.listBranches({ owner, repo, per_page: 100 }),
    octokit.repos.listTags({ owner, repo, per_page: 100 }),
  ]);
  return {
    branches: branchesRes.status === "fulfilled" ? branchesRes.value.data.map((b) => b.name) : [],
    tags: tagsRes.status === "fulfilled" ? tagsRes.value.data.map((t) => t.name) : [],
  };
}

export async function fetchTree(
  params: Pick<FileParams, "owner" | "repo" | "ref" | "token">,
): Promise<string[]> {
  const { owner, repo, ref, token } = params;
  const octokit = new Octokit({ auth: token });
  try {
    const res = await octokit.git.getTree({ owner, repo, tree_sha: ref, recursive: "1" });
    return res.data.tree
      .filter((item) => item.type === "blob" && item.path)
      .map((item) => item.path as string);
  } catch {
    return [];
  }
}

export async function fetchFileContent(params: FileParams): Promise<FileResult> {
  const { owner, repo, ref, path, token } = params;
  const octokit = new Octokit({ auth: token });

  try {
    const response = await octokit.repos.getContent({ owner, repo, path, ref });
    const data = response.data;

    if (Array.isArray(data) || data.type !== "file") {
      throw new GitHubError("指定されたパスはファイルではありません", 400);
    }

    if (!data.content) {
      throw new GitHubError("ファイル内容を取得できませんでした", 500);
    }

    const binary = atob(data.content.replace(/\n/g, ""));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const content = new TextDecoder().decode(bytes);
    return { content, sha: data.sha };
  } catch (error: unknown) {
    if (error instanceof GitHubError) throw error;

    const status = getStatus(error);
    if (status === 404) {
      throw new GitHubError("リポジトリまたはファイルが見つかりません", 404);
    }
    if (status === 401 || status === 403) {
      const message = isRateLimit(error)
        ? "API レート制限に達しました。PAT を入力するか、しばらく待ってください"
        : "プライベートリポジトリには PAT が必要です";
      throw new GitHubError(message, status);
    }

    throw new GitHubError("ファイルの取得に失敗しました", 500);
  }
}

function getStatus(error: unknown): number | null {
  if (error && typeof error === "object" && "status" in error) {
    return (error as { status: number }).status;
  }
  return null;
}

function isRateLimit(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const remaining = (error as { response?: { headers?: Record<string, string> } }).response
    ?.headers?.["x-ratelimit-remaining"];
  return remaining === "0";
}
