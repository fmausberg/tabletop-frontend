"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../../../components/ui/spinning-loading-states";
import Button from "../../../components/ui/button";
import { useAuth } from "../../../context/AuthContext";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const router = useRouter();
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: async (userData: LoginFormInputs) => {
      const success = await login(userData.email, userData.password);
      if (!success) {
        throw new Error("Login fehlgeschlagen");
      }
      return success;
    },
    onSuccess: () => {
      router.push("/home/user/questions");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8 text-textPrimary">
          Login
        </h1>

        <form
          onSubmit={handleSubmit((data) => loginMutation.mutate(data))}
          className="space-y-6"
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-textPrimary mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email", { required: "Email ist erforderlich" })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-formsDesigns-focus border-slate-300"
              placeholder="ihre@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-textPrimary mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password", {
                required: "Passwort ist erforderlich",
              })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-formsDesigns-focus border-slate-300"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Error vom Server */}
          {loginMutation.isError && (
            <p className="text-red-500 text-center">
              {(loginMutation.error as Error).message}
            </p>
          )}

          {/* Loading */}
          {loginMutation.isPending && (
            <div className="flex justify-center">
              <LoadingSpinner size="large" color="primary" />
            </div>
          )}

          {/* Additional Links */}
          <div className="flex items-center justify-between text-sm">
            {/*<label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-formsDesigns-checkbox shadow-sm focus:formsDesigns-focus focus:ring focus:ring-formsDesigns-focus focus:ring-opacity-50"
              />
              <span className="ml-2 text-textPrimary">Stay logged in</span>
            </label>*/}
            {/*<a
              href="/home/auth/forgot-password"
              className="text-links hover:text-links-hover"
            >
              Forgot password?
            </a>*/}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
            color="primary"
          >
            Login
          </Button>

          {/* Registration Link */}
          <p className="text-center text-sm text-textPrimary-light">
            No account yet?{" "}
            <a
              href="/home/register"
              className="text-links hover:text-links-hover"
            >
              Register now
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
