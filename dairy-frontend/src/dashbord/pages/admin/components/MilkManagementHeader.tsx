import React, { useState, useRef, useEffect } from "react";
import { RotateCcw, Download, Filter, Calendar, X } from "lucide-react";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Session = "all" | "morning" | "night";

interface MilkManagementHeaderProps {
  filters: any;
  handleFilterChange: (key: string, value: any) => void;
  handleResetFilters: () => void;
  handleExportCSV: () => void;
  fetchMilkData: () => void;
  data: any[];
  date: string;
  setDate: (date: string) => void;
  selectedFilter: Session;
  setSelectedFilter: (value: Session) => void;
}

// ─── Primitives ───────────────────────────────────────────────────────────────
function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
    >
      {children}
    </label>
  );
}

// ─── Calendar Dropdown Component ───────────────────────────────────────────────
interface CalendarDropdownProps {
  date: string;
  onDateChange: (date: string) => void;
}

const CalendarDropdown: React.FC<CalendarDropdownProps> = ({ date, onDateChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-9 sm:h-10 px-3 pr-10 rounded-lg text-xs sm:text-sm font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all outline-none cursor-pointer text-left flex items-center justify-between"
      >
        <span>{date || "Select Date"}</span>
        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>

      {/* Dropdown Calendar */}
      {isOpen && (
        <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Select Date</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <div className="nepali-date-picker-wrapper">
            <NepaliDatePicker
              inputClassName="
                w-full h-10 px-3
                rounded-lg text-sm font-medium
                bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200
                hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900
                transition-all outline-none cursor-pointer
              "
              value={date}
              onChange={(v: string) => {
                onDateChange(v);
                setIsOpen(false);
              }}
              options={{
                calenderLocale: "ne",
                valueLocale: "en",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MilkManagementHeader: React.FC<MilkManagementHeaderProps> = ({
  filters,
  handleFilterChange,
  handleResetFilters,
  data,
  date,
  setDate,
  selectedFilter,
  setSelectedFilter,
}) => {
  return (
    <>
      <div className="mb-6">

        {/* ── Header Section ── */}
        <div className="flex   justify-between gap-4 mb-4 sm:mb-6">
          {/* Title Section */}
          <div className="flex items-center gap-4">
            <div className="p-3  rounded-xl ">
              <Filter className="w-6 h-6 sm:w-5 text-green-500  sm:h-5 " />
            </div>
            <div className="flex-1">
              <h2 className="text-sm sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                Milk Management
              </h2>
              <p className="text-base sm:text-base hidden md:block  dark:text-gray-400 mt-1">
                Filter and manage daily milk collection records
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={handleResetFilters}
              variant="outline"
              size="sm"
              className="border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
        
          </div>
        </div>

        {/* ── Filter Section ── */}
        <div className="overflow-visible">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4  gap-3 sm:gap-4 overflow-visible">

            {/* User */}
            <div className="overflow-visible">
              <FieldLabel htmlFor="user-filter">User</FieldLabel>
              <Select
                value={filters.userid || "all"}
                onValueChange={(v) => handleFilterChange("userid", v === "all" ? "" : v)}
              >
                <SelectTrigger id="user-filter" className="h-9 sm:h-10 w-full text-sm">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {data?.map((u: any) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date (BS) — NepaliDatePicker */}
            <div className="overflow-visible relative ">
              <FieldLabel htmlFor="date-filter">Date (BS)</FieldLabel>
              <div className="relative overflow-visible">
                <NepaliDatePicker
                  inputClassName="
                    block w-full h-9 sm:h-10 pl-3 pr-9
                    rounded-lg text-xs sm:text-sm font-medium
                    bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200
                    hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900
                    transition-all outline-none cursor-pointer
                  "
                  value={date}
                  onChange={(v: string) => setDate(v)}
                  options={{
                    calenderLocale: "ne",
                    valueLocale: "en",
                  }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </span>
              </div>
            </div>

            {/* Session */}
            <div>
              <FieldLabel htmlFor="session-filter">Session</FieldLabel>
              <Select
                value={selectedFilter}
                onValueChange={(v) => setSelectedFilter(v as Session)}
              >
                <SelectTrigger id="session-filter" className="h-9 sm:h-10 text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🌅 All Sessions</SelectItem>
                  <SelectItem value="morning">☀️ Morning</SelectItem>
                  <SelectItem value="night">🌙 Night</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Per page */}
            <div>
              <FieldLabel htmlFor="limit-filter">Rows Per Page</FieldLabel>
              <Select
                value={String(filters.limit)}
                onValueChange={(v) => handleFilterChange("limit", parseInt(v))}
              >
                <SelectTrigger id="limit-filter" className="h-9 sm:h-10 text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 rows</SelectItem>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="25">25 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                  <SelectItem value="100">100 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};



export default MilkManagementHeader;