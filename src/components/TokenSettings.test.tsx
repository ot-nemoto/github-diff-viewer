import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TokenSettings } from "@/components/TokenSettings";
import { validateToken } from "@/lib/github";
import { clearToken, getToken, setToken } from "@/lib/storage";

vi.mock("@/lib/storage");
vi.mock("@/lib/github");

const mockGetToken = vi.mocked(getToken);
const mockSetToken = vi.mocked(setToken);
const mockClearToken = vi.mocked(clearToken);
const mockValidateToken = vi.mocked(validateToken);

describe("TokenSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockReturnValue(null);
  });

  test("shows '設定' button", () => {
    render(<TokenSettings />);
    expect(screen.getByRole("button", { name: "設定" })).toBeInTheDocument();
  });

  test("opens modal when '設定' is clicked", () => {
    render(<TokenSettings />);
    fireEvent.click(screen.getByRole("button", { name: "設定" }));
    expect(screen.getByPlaceholderText("ghp_xxxxxxxxxxxx")).toBeInTheDocument();
  });

  test("shows saved token in input when modal opens", () => {
    mockGetToken.mockReturnValue("ghp_existing");
    render(<TokenSettings />);
    fireEvent.click(screen.getByRole("button", { name: "設定" }));
    expect(screen.getByPlaceholderText("ghp_xxxxxxxxxxxx")).toHaveValue("ghp_existing");
  });

  test("shows 削除 button only when token is set", () => {
    mockGetToken.mockReturnValue("ghp_existing");
    render(<TokenSettings />);
    fireEvent.click(screen.getByRole("button", { name: "設定" }));
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });

  test("does not show 削除 button when no token is set", () => {
    render(<TokenSettings />);
    fireEvent.click(screen.getByRole("button", { name: "設定" }));
    expect(screen.queryByRole("button", { name: "削除" })).not.toBeInTheDocument();
  });

  test("検証 button is disabled when input is empty", () => {
    render(<TokenSettings />);
    fireEvent.click(screen.getByRole("button", { name: "設定" }));
    expect(screen.getByRole("button", { name: "検証" })).toBeDisabled();
  });

  test("verifies token and shows success with login name", async () => {
    mockValidateToken.mockResolvedValue({ login: "octocat" });
    render(<TokenSettings />);
    fireEvent.click(screen.getByRole("button", { name: "設定" }));
    fireEvent.change(screen.getByPlaceholderText("ghp_xxxxxxxxxxxx"), {
      target: { value: "ghp_newtoken" },
    });
    fireEvent.click(screen.getByRole("button", { name: "検証" }));
    await waitFor(() => {
      expect(screen.getByText("✓ @octocat として認証済み")).toBeInTheDocument();
    });
    expect(mockSetToken).toHaveBeenCalledWith("ghp_newtoken");
  });

  test("shows error message with ✗ prefix on verification failure", async () => {
    mockValidateToken.mockRejectedValue({ message: "トークンが無効です" });
    render(<TokenSettings />);
    fireEvent.click(screen.getByRole("button", { name: "設定" }));
    fireEvent.change(screen.getByPlaceholderText("ghp_xxxxxxxxxxxx"), {
      target: { value: "ghp_bad" },
    });
    fireEvent.click(screen.getByRole("button", { name: "検証" }));
    await waitFor(() => {
      expect(screen.getByText("✗ トークンが無効です")).toBeInTheDocument();
    });
    expect(mockSetToken).not.toHaveBeenCalled();
  });

  test("verifies token on Enter key", async () => {
    mockValidateToken.mockResolvedValue({ login: "octocat" });
    render(<TokenSettings />);
    fireEvent.click(screen.getByRole("button", { name: "設定" }));
    const input = screen.getByPlaceholderText("ghp_xxxxxxxxxxxx");
    fireEvent.change(input, { target: { value: "ghp_enter" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => {
      expect(mockValidateToken).toHaveBeenCalledWith("ghp_enter");
    });
  });

  test("deletes token and closes modal when 削除 is clicked", () => {
    mockGetToken.mockReturnValue("ghp_existing");
    render(<TokenSettings />);
    fireEvent.click(screen.getByRole("button", { name: "設定" }));
    fireEvent.click(screen.getByRole("button", { name: "削除" }));
    expect(mockClearToken).toHaveBeenCalled();
    expect(screen.queryByPlaceholderText("ghp_xxxxxxxxxxxx")).not.toBeInTheDocument();
  });

  test("closes modal when Escape key is pressed in input", () => {
    render(<TokenSettings />);
    fireEvent.click(screen.getByRole("button", { name: "設定" }));
    const input = screen.getByPlaceholderText("ghp_xxxxxxxxxxxx");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByPlaceholderText("ghp_xxxxxxxxxxxx")).not.toBeInTheDocument();
  });

  test("closes modal when overlay is clicked", () => {
    render(<TokenSettings />);
    fireEvent.click(screen.getByRole("button", { name: "設定" }));
    fireEvent.click(screen.getByRole("button", { name: "モーダルを閉じる" }));
    expect(screen.queryByPlaceholderText("ghp_xxxxxxxxxxxx")).not.toBeInTheDocument();
  });
});
