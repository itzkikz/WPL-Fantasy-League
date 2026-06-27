import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import DarkLogo from "../assets/wplf1-dark.png";
import LightLogo from "../assets/wplf1-light.png";
import { useLogin } from "../features/auth/hooks";
import { GoogleLogin } from "@react-oauth/google";
import Button from "../components/common/Button";

const LoginPage = () => {
  const navigate = useNavigate();

  const mutation = useLogin((data) => {
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }
    navigate({ to: "/manager" });
  });

  const handleGoogleSuccess = (credentialResponse: any) => {
    mutation.mutate({
      credential: credentialResponse.credential,
    });
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed");
  };

  return (
    <div className="h-full flex-1 bg-white-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-sm flex items-center justify-center">
            <img
              src={DarkLogo}
              alt="PLogo"
              className="hidden dark:block w-20 h-20 animate-bounce"
            />
            <img
              src={LightLogo}
              alt="PLogo"
              className="block dark:hidden w-20 h-20 animate-bounce"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-center mb-8">Log In</h1>
        {mutation.isError && (
          <h1 className="text-base font-semibold text-center text-red-700 mb-8">
            {mutation?.error?.data?.error}
          </h1>
        )}

        <div className="space-y-4">
          <div className="flex justify-center mt-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="filled_black"
              shape="pill"
            />
          </div>
          
          <div className="flex justify-center mt-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <Button
              type="NoBackground"
              label="Skip for now"
              onClick={() => navigate({ to: "/standings" })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
