import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-0dmutbo3qxuhffpp.us.auth0.com"
      clientId="bcyRJztTWeuMUJtHAULBGkS4A2sCBUsQ"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>
);
