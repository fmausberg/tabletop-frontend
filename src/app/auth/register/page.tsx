"use client";

import { useRouter } from "next/navigation";
import Button from "../../../components/ui/button";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { fetchRegisterData } from "../../../utils/fetch-functions";

export default function RegisterPage() {
  type RegisterFormInputs = {
    email: string;
    password: string;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>();
  const router = useRouter();
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterFormInputs) => {
      const response = await fetchRegisterData(userData);
      const data = await response.json();
      if (!response.ok || data.error) {
        if (data.issues) {
          throw new Error(data.issues[0].message);
        }
        throw new Error(data.message || "Ein Fehler ist aufgetreten");
      }
      return data;
    },
    onSuccess: () => {
      router.push("/auth/register/mail-verification");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-16 pb-16">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8 text-textPrimary">
          Registrieren
        </h1>

        <form
          onSubmit={handleSubmit((data) => registerMutation.mutate(data))}
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="mail"
              className="block text-sm font-medium text-textPrimary mb-2"
            >
              Email
            </label>
            <input
              type="mail"
              id="mail"
              {...register("email", { required: "Email is required" })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-formsDesigns-focus border-slate-300"
              placeholder="ihre@mail.com"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Passwort Feld */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-textPrimary mb-2"
            >
              Passwort
            </label>
            <input
              type="password"
              id="password"
              {...register("password", {
                required: "Password is required",
              })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-formsDesigns-focus border-slate-300"
              placeholder="••••••••"
              required
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          {registerMutation.isError && (
            <p className="text-red-500 text-center">
              {(registerMutation.error as Error).message}
            </p>
          )}
          {/*<div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-formsDesigns-checkbox shadow-sm focus:formsDesigns-focus focus:ring focus:ring-formsDesigns-focus focus:ring-opacity-50"
                required
              />
              <span className="ml-2 text-textPrimary">
                Datenschutz akzeptieren
              </span>
            </label>
            <a
              href="/home/auth/forgot-password"
              className="text-links hover:text-links-hover"
            >
              Datenschutzerklärung
            </a>
          </div>*}

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            Registrieren
          </Button>

          {/* Registrierungs-Link */}
          <p className="text-center text-sm text-textPrimary-light">
            Bereits ein Konto?{" "}
            <a
              href="/home//auth/login"
              className="text-links hover:text-links-hover"
            >
              Jetzt einloggen
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
