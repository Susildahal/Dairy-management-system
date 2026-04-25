import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Lock, Mail, Milk, Loader2 } from "lucide-react"
import axiosInstance from "@/utils/axiosInstance"
import { apiToast } from "@/utils/toast"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigator = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email.")
      setIsLoading(false)
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      setIsLoading(false)
      return
    }

    try {
      const response = await axiosInstance.post("/users/login", {
        email,
        password,
      })

      if (response.status === 200) {
        localStorage.setItem("flag", "true")
        const token = response.data.auth_token
        localStorage.setItem("auth_token", token)

        const userData = await login()

        apiToast.login.success()

        setTimeout(() => {
          if (userData.role === "superadmin") {
            navigator("/superadmin/dashboard")
          } else if (userData.role === "admin") {
            navigator("/admin/dashboard")
          } else {
            navigator("/user/dashboard")
          }
        }, 100)
      } else {
        throw new Error("Login failed")
      }
    } catch (error: any) {
      localStorage.removeItem("flag")
      const message = error?.response?.data?.message || error?.message || "Login failed"
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
          {/* <p className="text-blue-200 text-sm uppercase tracking-widest font-medium mb-4">Admin Dashboard</p> */}
          <h1 className="text-white text-4xl font-bold leading-snug mb-4">
            Manage your dairy operations in one place.
          </h1>
          <p className="text-blue-200 text-sm leading-relaxed">
            Track inventory, monitor production, manage staff, and generate reports — all from a single unified interface.
          </p>
        </div>

        <p className="text-blue-300 text-xs">© {new Date().getFullYear()} DairyConnect. All rights reserved.</p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10">
            <div className="bg-blue-700 p-2 rounded-lg">
              <Milk className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-800 font-semibold text-lg tracking-tight">DairyConnect</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in to your account</h2>
          <p className="text-sm text-gray-500 mb-8">Enter your credentials to access the admin panel.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@dairy.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 rounded-lg text-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Button
                  variant="link"
                  className="px-0 text-xs text-blue-600 hover:text-blue-700 font-medium h-auto"
                >
                  Forgot password?
                </Button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 rounded-lg text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                Remember me
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-sm transition-colors duration-200 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* <p className="mt-8 text-center text-xs text-gray-400">
            Having trouble? Contact{" "}
            <a href="mailto:support@dairy.com" className="text-blue-600 hover:underline">
              support@dairy.com
            </a>
          </p> */}
        </div>
      </div>
    </div>
  )
}