import { useState } from "react";
import CommuteMemoryAgent from "./components/CommuteMemoryAgent";
import Nav from "./components/Nav";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const [view, setView] = useState("chat");
  const { user, isAuthenticated, login, logout } = useAuth();

  if (view === "login") {
    return (
      <LoginPage
        onLogin={(token, userId, email) => {
          login(token, userId, email);
          setView("chat");
        }}
        onSwitchToSignup={() => setView("signup")}
        onBack={() => setView("chat")}
      />
    );
  }

  if (view === "signup") {
    return (
      <SignupPage
        onLogin={(token, userId, email) => {
          login(token, userId, email);
          setView("chat");
        }}
        onSwitchToLogin={() => setView("login")}
        onBack={() => setView("chat")}
      />
    );
  }

  return (
    <>
      <Nav
        isAuthenticated={isAuthenticated}
        user={user}
        onLoginClick={() => setView("login")}
        onSignupClick={() => setView("signup")}
        onLogoutClick={logout}
        onLogoClick={() => setView("chat")}
      />
      <CommuteMemoryAgent />
    </>
  );
}