import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import { store } from "./store";
import "./index.css";

// TODO: register service worker for PWA (handled by vite-plugin-pwa in prod build)

// Empty until a real Google Cloud OAuth Client ID is set in .env — the
// "Continue with Google" button still renders in that case, it just can't
// complete a sign-in (see GoogleLoginButton.tsx).
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={googleClientId}>
          <App />
        </GoogleOAuthProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
