import React, { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useValidateToken } from "../features/auth/hooks";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useValidateToken();

  useEffect(() => {
    if (isError || (data && !data.valid)) {
      localStorage.removeItem("token");
      navigate({ to: "/login" });
    }
  }, [data, isError, navigate]);

  // if (isLoading) return <div>Checking authentication...</div>;

  // Only render children if token is valid
  if (!data?.valid) return null;

  return <>{children}</>;
}
