import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import auth from "../../ultilities/auth";

export default function RequireAdmin({ children }) {
  const [checking, setChecking] = useState(true);
  const [ok, setOk] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    auth
      .me()
      .then(() => mounted && setOk(true))
      .catch(() => mounted && setOk(false))
      .finally(() => mounted && setChecking(false));

    return () => {
      mounted = false;
    };
  }, []);

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "#64748b",
          fontWeight: 700,
        }}
      >
        Checking admin session…
      </div>
    );
  }

  if (!ok) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children || null;
}
