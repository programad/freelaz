import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import { SubmissionsPage } from "./submissions-page";
import "./index.css";

const path = window.location.pathname;
const Page =
  path === "/relatos" || path === "/relatos/" ? SubmissionsPage : App;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Page />
  </StrictMode>
);
