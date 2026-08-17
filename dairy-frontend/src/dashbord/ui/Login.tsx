import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Milk,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { apiToast } from "@/utils/toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [twoFactorSent, setTwoFactorSent] = useState(false);

  const navigator = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("auth.invalidEmail"));
      setIsLoading(false);
      return;
    }

    // Validate password
    if (password.length < 6) {
      setError(t("auth.passwordMinLength"));
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/users/login", {
        email,
        password,
      });

      if (response.status !== 200) {
        throw new Error("Login failed");
      }

      const { user, message } = response.data;

      /*
       * ==========================================
       * ADMIN / SUPERADMIN
       * ==========================================
       *
       * Backend does NOT return auth_token here.
       * Instead, it sends a login link to email.
       */
      if (
        user?.role === "admin" ||
        user?.role === "superadmin"
      ) {
        setTwoFactorSent(true);

        apiToast.login.success();

        return;
      }

      /*
       * ==========================================
       * NORMAL USER
       * ==========================================
       */

      localStorage.setItem("flag", "true");

      if (response.data.auth_token) {
        localStorage.setItem(
          "auth_token",
          response.data.auth_token
        );
      }

      // Get authenticated user
      const userData = await login();

      apiToast.login.success();

      setTimeout(() => {
        if (userData.role === "superadmin") {
          navigator("/superadmin/dashboard");
        } else if (userData.role === "admin") {
          navigator("/admin/dashboard");
        } else {
          navigator("/user/dashboard");
        }
      }, 100);
    } catch (error: any) {
      localStorage.removeItem("flag");
      localStorage.removeItem("auth_token");

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * ==========================================
   * 2FA EMAIL SENT SCREEN
   * ==========================================
   */

  if (twoFactorSent) {
    return (
      <div className="min-h-screen flex bg-gray-50 font-sans">
        {/* Left branding panel */}
        <div className="hidden lg:flex lg:w-2/5 bg-blue-700 flex-col justify-between p-12">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 p-2 rounded-lg">
              <Milk className="w-5 h-5 text-white" />
            </div>

            <span className="text-white font-semibold text-lg tracking-tight">
              DairyConnect
            </span>
          </div>

          <div>
            <h1 className="text-white text-4xl font-bold leading-snug mb-4">
              Manage your dairy operations in one place.
            </h1>

            <p className="text-blue-200 text-sm leading-relaxed">
              Track inventory, monitor production, manage staff,
              and generate reports — all from a single unified
              interface.
            </p>
          </div>

          <p className="text-blue-300 text-xs">
            © {new Date().getFullYear()} DairyConnect. All rights
            reserved.
          </p>
        </div>

        {/* Success panel */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Check your email
            </h2>

            <p className="text-sm text-gray-500 leading-relaxed mb-2">
              We have sent a secure login link to:
            </p>

            <p className="text-sm font-semibold text-gray-800 mb-6">
              {email}
            </p>

            <Alert className="text-left border-blue-200 bg-blue-50">
              <Mail className="h-4 w-4 text-blue-600" />

              <AlertDescription className="text-blue-700">
                The login link will expire in 15 minutes. Open
                the link from your email to continue.
              </AlertDescription>
            </Alert>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-6"
              onClick={() => {
                setTwoFactorSent(false);
                setError("");
              }}
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-blue-700 flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <div className="bg-white/20 p-2 rounded-lg">
            <Milk className="w-5 h-5 text-white" />
          </div>

          <span className="text-white font-semibold text-lg tracking-tight">
            DairyConnect
          </span>
        </div>

        <div>
          <h1 className="text-white text-4xl font-bold leading-snug mb-4">
            Manage your dairy operations in one place.
          </h1>

          <p className="text-blue-200 text-sm leading-relaxed">
            Track inventory, monitor production, manage staff,
            and generate reports — all from a single unified
            interface.
          </p>
        </div>

        <p className="text-blue-300 text-xs">
          © {new Date().getFullYear()} DairyConnect. All rights
          reserved.
        </p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10">
            <div className="bg-blue-700 p-2 rounded-lg">
              <Milk className="w-5 h-5 text-white" />
            </div>

            <span className="text-gray-800 font-semibold text-lg tracking-tight">
              DairyConnect
            </span>
          </div>

          {/* Language */}
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                i18n.changeLanguage(
                  i18n.language?.startsWith("np")
                    ? "en"
                    : "np"
                )
              }
            >
              {(i18n.language || "en")
                .slice(0, 2)
                .toUpperCase()}
            </Button>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {t("auth.title")}
          </h2>

          <p className="text-sm text-gray-500 mb-8">
            {t("auth.subtitle")}
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Error */}
            {error && (
              <Alert
                variant="destructive"
                className="border-red-200 bg-red-50"
              >
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                {t("auth.email")}
              </Label>

              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />

                <Input
                  id="email"
                  type="email"
                  placeholder={t(
                    "auth.emailPlaceholder"
                  )}
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="pl-9 h-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 rounded-lg text-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("auth.password")}
                </Label>

                <Button
                  type="button"
                  variant="link"
                  onClick={() =>
                    navigator("/forgot-password")
                  }
                  className="px-0 text-xs text-blue-600 hover:text-blue-700 font-medium h-auto"
                >
                  {t("auth.forgotPassword")}
                </Button>
              </div>

              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />

                <Input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder={t(
                    "auth.passwordPlaceholder"
                  )}
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="pl-9 pr-10 h-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 rounded-lg text-sm"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? t("auth.hidePassword")
                      : t("auth.showPassword")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />

              <Label
                htmlFor="remember"
                className="text-sm text-gray-600 cursor-pointer"
              >
                {t("auth.rememberMe")}
              </Label>
            </div>

            {/* Login */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-sm transition-colors duration-200 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                  {t("auth.signingIn")}
                </>
              ) : (
                t("auth.signIn")
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}