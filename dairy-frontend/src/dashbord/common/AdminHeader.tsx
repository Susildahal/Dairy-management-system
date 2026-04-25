import React from "react";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  subtitle: string;
  linkname: string;
  linkto: string;
}

const AdminHeader = ({ title, subtitle, linkname, linkto }: AdminHeaderProps) => {
  return (
    <div className="  mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="p-3 sm:p-4 ">
          <Users className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="flex-1">
          <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </CardTitle>
          <CardDescription className="text-base sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            {subtitle}
          </CardDescription>
        </div>
      </div>

      {/* Right Section */}
      <Link to={linkto} className="w-full sm:w-auto">
        <Button
          className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg"
          size="sm"
        >
          {linkname}
        </Button>
      </Link>
    </div>
  );
};

export default AdminHeader;
