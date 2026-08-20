import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import { Loader2 } from "lucide-react";
import { apiToast } from "@/utils/toast";

export default function AdminLoginVerify() {
  const { token } = useParams();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const [error, setError] = useState("");

  useEffect(() => {
    // Guard against React StrictMode double-mount or navigate reference changes
    // causing a second API call after the token has already been consumed.
    if (hasFetched.current) return;
    hasFetched.current = true;

    const verifyLogin = async () => {
      try {
        if (!token) {
          setError("Invalid login link");
          return;
        }

        const response = await axiosInstance.get(
          `/users/loginforadmin/${token}`
        );

        if (response.data.success) {
          const user = response.data.user;

          localStorage.setItem("flag", "true");

          apiToast.login.success();

          if (user.role === "superadmin") {
            navigate("/superadmin/dashboard", {
              replace: true,
            });
          } else if (user.role === "admin") {
            navigate("/admin/dashboard", {
              replace: true,
            });
          }
        }
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            "Login link is invalid or expired"
        );
      }
    };

    verifyLogin();
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">
            Login Failed
          </h2>

          <p className="text-gray-500 mt-2">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />

        <h2 className="mt-4 font-semibold">
          Verifying your login...
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Please wait.
        </p>
      </div>
    </div>
  );
}