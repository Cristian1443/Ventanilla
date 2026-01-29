import { render, screen } from "@testing-library/react";
import SignIn from "@/components/SignIn";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

describe("SignIn", () => {
  it("debe renderizar el botón de login", () => {
    render(<SignIn />);
    const button = screen.getByRole("button", { name: /ingresar con microsoft/i });
    expect(button).toBeInTheDocument();
  });

  it("debe tener el texto correcto", () => {
    render(<SignIn />);
    expect(screen.getByText(/ingresar con microsoft/i)).toBeInTheDocument();
  });
});
