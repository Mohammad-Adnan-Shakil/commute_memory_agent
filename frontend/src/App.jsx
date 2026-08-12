import { useState } from "react";
import CommuteMemoryAgent from "./components/CommuteMemoryAgent";
import LandingPage from "./components/LandingPage";
import Nav from "./components/Nav";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [view, setView] = useState(() => (isAuthenticated ? "chat" : "landing"));

  if (view === "login") {
    return (
      <LoginPage
        onLogin={(token, userId, email) => {
          login(token, userId, email);
          setView("chat");
        }}
        onSwitchToSignup={() => setView("signup")}
        onBack={() => setView(isAuthenticated ? "chat" : "landing")}
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
        onBack={() => setView(isAuthenticated ? "chat" : "landing")}
      />
    );
  }

  if (view === "landing" && !isAuthenticated) {
    return (
      <LandingPage
        onSignupClick={() => setView("signup")}
        onLoginClick={() => setView("login")}
        onTryWithoutAccount={() => setView("chat")}
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
        onLogoutClick={() => {
          logout();
          setView("landing");
        }}
        onLogoClick={() => setView(isAuthenticated ? "chat" : "landing")}
      />
      <CommuteMemoryAgent />
    </>
  );
}
