import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, Milk, Loader2, CheckCircle2, AlertTriangle } from "lucide-react"
import axiosInstance from "@/utils/axiosInstance"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import i18n from "@/i18n"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || ""

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!token) {
      setError(t("auth.invalidToken") || "Invalid or missing password reset token.")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError(t("auth.passwordMinLength") || "Password must be at least 6 characters long.")
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch") || "Passwords do not match.")
      setIsLoading(false)
      return
    }

    try {
      const response = await axiosInstance.post("/users/reset-password", {
        token,
        newPassword,
      })

      if (response.data.success) {
        setIsSuccess(true)
        toast.success(t("auth.resetPasswordSuccess") || "Password reset successfully!")
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        t("auth.resetPasswordError") ||
        "Failed to reset password. The link may have expired."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-blue-700 flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <div className="bg-white/20 p-2 rounded-lg">
            <Milk className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">DairyConnect</span>
        </div>

        <div>
          <h1 className="text-white text-4xl font-bold leading-snug mb-4">
            Set your new account password.
          </h1>
          <p className="text-blue-200 text-sm leading-relaxed">
            Choose a strong password to ensure the security of your DairyConnect account.
          </p>
        </div>

        <p className="text-blue-300 text-xs">© {new Date().getFullYear()} DairyConnect. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="bg-blue-700 p-2 rounded-lg">
              <Milk className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-800 font-semibold text-lg tracking-tight">{t("auth.brand")}</span>
          </div>

          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => i18n.changeLanguage(i18n.language && i18n.language.startsWith("np") ? "en" : "np")}
            >
              {(i18n.language || "en").slice(0, 2).toUpperCase()}
            </Button>
          </div>

          {!token ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t("auth.invalidLinkTitle") || "Invalid Reset Link"}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t("auth.invalidLinkMessage") ||
                  "The password reset token is missing or invalid. Please request a new password reset link."}
              </p>
              <div className="pt-4 flex flex-col gap-2">
                <Button
                  onClick={() => navigate("/forgot-password")}
                  className="w-full h-10 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-sm"
                >
                  {t("auth.requestNewLink") || "Request New Link"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="w-full h-10 rounded-lg text-sm"
                >
                  {t("auth.backToLogin") || "Back to Login"}
                </Button>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t("auth.passwordResetSuccessTitle") || "Password Reset Complete"}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t("auth.passwordResetSuccessMessage") ||
                  "Your password has been successfully updated. You can now log in with your new password."}
              </p>
              <div className="pt-4">
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full h-10 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-sm transition-colors duration-200"
                >
                  {t("auth.signInWithNewPassword") || "Sign In Now"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {t("auth.resetPasswordTitle") || "Create New Password"}
              </h2>
              <p className="text-sm text-gray-500 mb-8">
                {t("auth.resetPasswordSubtitle") || "Your new password must be at least 6 characters."}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                {/* New Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                    {t("auth.newPassword") || "New Password"}
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder={t("auth.passwordPlaceholder")}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-9 pr-10 h-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 rounded-lg text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    {t("auth.confirmPassword") || "Confirm New Password"}
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("auth.passwordPlaceholder")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9 pr-10 h-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 rounded-lg text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-sm transition-colors duration-200 shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("auth.resettingPassword") || "Resetting password..."}
                    </>
                  ) : (
                    t("auth.resetPasswordSubmit") || "Reset Password"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
