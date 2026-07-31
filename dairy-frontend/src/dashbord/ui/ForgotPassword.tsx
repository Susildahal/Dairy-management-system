import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Milk, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import axiosInstance from "@/utils/axiosInstance"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import i18n from "@/i18n"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("auth.invalidEmail") || "Please enter a valid email address.")
      setIsLoading(false)
      return
    }

    try {
      const response = await axiosInstance.post("/users/forgot-password", { email })
      if (response.data.success) {
        setIsSubmitted(true)
        toast.success(t("auth.resetLinkSentSuccess") || "Password reset link sent to your email!")
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        t("auth.forgotPasswordError") ||
        "Failed to send reset link. Please try again."
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
            Reset your password securely.
          </h1>
          <p className="text-blue-200 text-sm leading-relaxed">
            Enter your registered email address and we'll send you a secure link to reset your account password.
          </p>
        </div>

        <p className="text-blue-300 text-xs">© {new Date().getFullYear()} DairyConnect. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10">
            <div className="bg-blue-700 p-2 rounded-lg">
              <Milk className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-800 font-semibold text-lg tracking-tight">{t("auth.brand")}</span>
          </div>

          <div className="flex justify-between items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
              className="text-gray-600 hover:text-gray-900 p-0 hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              {t("auth.backToLogin") || "Back to Login"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => i18n.changeLanguage(i18n.language && i18n.language.startsWith("np") ? "en" : "np")}
            >
              {(i18n.language || "en").slice(0, 2).toUpperCase()}
            </Button>
          </div>

          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t("auth.checkYourEmail") || "Check your email"}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t("auth.resetEmailInstructions") ||
                  `We've sent a password reset link to ${email}. Please check your inbox and click the link to reset your password.`}
              </p>
              <div className="pt-4">
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full h-10 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-sm transition-colors duration-200"
                >
                  {t("auth.returnToLogin") || "Return to Login"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {t("auth.forgotPasswordTitle") || "Forgot Password?"}
              </h2>
              <p className="text-sm text-gray-500 mb-8">
                {t("auth.forgotPasswordSubtitle") ||
                  "No worries, enter your email address below and we'll send you a password reset link."}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    {t("auth.email")}
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("auth.emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 rounded-lg text-sm"
                      required
                    />
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
                      {t("auth.sendingLink") || "Sending reset link..."}
                    </>
                  ) : (
                    t("auth.sendResetLink") || "Send Reset Link"
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
