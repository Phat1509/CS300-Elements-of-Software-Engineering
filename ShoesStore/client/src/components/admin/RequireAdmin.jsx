import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import auth from "../../ultilities/auth";

export default function RequireAdmin({ children }) {
  const [checking, setChecking] = useState(true);
  const [ok, setOk] = useState(false);

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

  if (checking)
    return <div className="container">Checking admin session...</div>;
  if (!ok) return <Navigate to="/admin/login" replace />;
  return children || null;
}
