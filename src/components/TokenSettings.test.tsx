import { fireEvent, render, screen } from "@testing-library/react";
import { TokenSettings } from "@/components/TokenSettings";
import { clearToken, getToken, setToken } from "@/lib/storage";

vi.mock("@/lib/storage");

const mockGetToken = vi.mocked(getToken);
const mockSetToken = vi.mocked(setToken);
const mockClearToken = vi.mocked(clearToken);

describe("TokenSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockReturnValue(null);
  });

  test("shows 'トークンを設定' button when no token is set", () => {
    render(<TokenSettings />);
    expect(screen.getByRole("button", { name: "トークンを設定" })).toBeInTheDocument();
  });

  test("shows 'トークンをクリア' button when token is already set", () => {
    mockGetToken.mockReturnValue("ghp_existing");
    render(<TokenSettings />);
    expect(screen.getByRole("button", { name: "トークンをクリア" })).toBeInTheDocument();
  });

  test("shows input field after clicking 'トークンを設定'", () => {
    render(<TokenSettings />);
    fireEvent.click(screen.getByRole("button", { name: "トークンを設定" }));
    expect(screen.getByPlaceholderText("GitHub Personal Access Token")).toBeInTheDocument();
  });

  test("saves token and hides input on save", () => {
    render(<TokenSettings />);
    fireEvent.click(screen.getByRole("button", { name: "トークンを設定" }));
    const input = screen.getByPlaceholderText("GitHub Personal Access Token");
    fireEvent.change(input, { target: { value: "ghp_newtoken" } });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    expect(mockSetToken).toHaveBeenCalledWith("ghp_newtoken");
    expect(screen.queryByPlaceholderText("GitHub Personal Access Token")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "トークンをクリア" })).toBeInTheDocument();
  });

  test("does not save when input is blank", () => {
    render(<TokenSettings />);
    fireEvent.click(screen.getByRole("button", { name: "トークンを設定" }));
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    expect(mockSetToken).not.toHaveBeenCalled();
  });

  test("saves token on Enter key", () => {
    render(<TokenSettings />);
    fireEvent.click(screen.getByRole("button", { name: "トークンを設定" }));
    const input = screen.getByPlaceholderText("GitHub Personal Access Token");
    fireEvent.change(input, { target: { value: "ghp_enter" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockSetToken).toHaveBeenCalledWith("ghp_enter");
  });

  test("clears token when 'トークンをクリア' is clicked", () => {
    mockGetToken.mockReturnValue("ghp_existing");
    render(<TokenSettings />);
    fireEvent.click(screen.getByRole("button", { name: "トークンをクリア" }));
    expect(mockClearToken).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "トークンを設定" })).toBeInTheDocument();
  });
});
