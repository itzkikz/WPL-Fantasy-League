import React, { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useValidateToken } from "../features/auth/hooks";
import { useUserStore } from "../store/useUserStore";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useValidateToken();
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    if (isError || (data && !data.valid)) {
      localStorage.removeItem("token");
      navigate({ to: "/login" });
    }
    if (data && data?.valid) {
      setUser({ teamName: data?.user?.userId });
    }
  }, [data, isError, navigate]);

  if (isLoading) return <div className="h-screen flex text-center justify-center items-center">Checking authentication...</div>;

  // Only render children if token is valid
  if (!data?.valid) return null;

  return <>{children}</>;
}
