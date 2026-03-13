import React from "react";
import { createRoot } from "react-dom/client";
import { AppShell } from "./app/app-shell.js";
import { ProfileProvider } from "./app/providers/profile-provider.js";
import "./styles.css";

const rootElement = document.querySelector<HTMLElement>("#app");
if (!rootElement) {
  throw new Error("Missing #app container.");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <ProfileProvider>
      <AppShell />
    </ProfileProvider>
  </React.StrictMode>
);
