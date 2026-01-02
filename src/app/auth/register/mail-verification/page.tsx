"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { fetchVerifyEmail } from "../../../../utils/fetch-functions";

export default function MailVerificationPage() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(searchParams.get("token"));
  }, [searchParams]);

  const { mutate, data, isError, error, isPending } = useMutation({
    mutationFn: async (token: string) => {
      const response = await fetchVerifyEmail(token);
      if (!response.ok) {
        throw new Error(data.message);
      }
      return response.json();
    },
  });

  useEffect(() => {
    if (token) {
      mutate(token);
    }
  }, [token, mutate]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-4 text-textPrimary">
            Please open your email address to confirm.
          </h1>
          <p className="text-center text-textPrimary-light">
            You will be redirected to our website directly via the link in your Mail.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4 text-textPrimary">
          {!isPending && data ? "Registration Successful" : "Email Bestätigung"}
        </h1>
        <p className="text-center text-textPrimary-light">
          {isPending && "Verifizierung läuft..."}
          {isError && (error as Error).message}
          {data && (
            <>
              Email verified successfully, please{" "}
              <a href="/auth/login" className="text-primaryButton hover:underline">
                login
              </a>{" "}
              now.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
