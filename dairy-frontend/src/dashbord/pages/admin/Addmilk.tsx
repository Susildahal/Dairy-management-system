import React, { useEffect, useState, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../store/store'
import { getdata } from "../../../store/slices/userSlicer"
import { getAllMilk, updateMilk, clearError } from "../../../store/slices/milkSlicer"
import { toast } from "sonner"
import AdminHeader from '@/dashbord/common/AdminHeader'
import Loading from '@/dashbord/ui/Loading'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getsettingdata } from "../../../store/slices/sitesettingSlicer"
import { Milk, Eye, Save,  Calendar } from "lucide-react"
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";
import ND from "nepali-date-converter"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik'
import * as Yup from 'yup'

// Calendar styling - matches MilkManagement
const CALENDAR_OVERRIDES = `
  .nepali-datepicker-wrapper,
  .nepali-datepicker {
    position: relative;   
    width: 100%;
  }

  .nepali-datepicker-wrapper input,
  .nepali-datepicker input {
    width: 100% !important;
    height: 36px !important;
    padding-left: 32px !important;
    padding-right: 12px !important;
    border-radius: 8px !important;
    border: 1px solid #e2e8f0 !important;
    background: #ffffff !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    color: #334155 !important;
    font-family: inherit !important;
    outline: none !important;
    cursor: pointer !important;
    transition: border-color 0.15s, box-shadow 0.15s !important;
    box-shadow: none !important;
  }
  .nepali-datepicker-wrapper input::placeholder,
  .nepali-datepicker input::placeholder {
    color: #94a3b8 !important;
    font-weight: 400 !important;
  }
  .nepali-datepicker-wrapper input:hover,
  .nepali-datepicker input:hover {
    border-color: #60a5fa !important;
  }
  .nepali-datepicker-wrapper input:focus,
  .nepali-datepicker input:focus {
    border-color: #2563eb !important;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
  }

  .calendar-container,
  .nepali-date-picker-calendar,
  .ndp-calendar {
    position: absolute !important;
    top: calc(100% + 6px) !important;
    left: 0 !important;
    right: auto !important;
    z-index: 9999 !important;
    width: 280px !important;
    background: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 12px !important;
    box-shadow: 0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06) !important;
    padding: 14px !important;
    font-family: inherit !important;
    overflow: hidden !important;
  }

  .calendar-header,
  .ndp-header {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    margin-bottom: 12px !important;
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    gap: 6px !important;
  }

  .calendar-header select,
  .ndp-header select,
  .ndp-month-select,
  .ndp-year-select {
    height: 30px !important;
    padding: 0 24px 0 8px !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 8px !important;
    background: #f8fafc !important;
    color: #1e293b !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    font-family: inherit !important;
    cursor: pointer !important;
    appearance: none !important;
    -webkit-appearance: none !important;
    outline: none !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-position: right 6px center !important;
    transition: border-color 0.15s !important;
  }
  .calendar-header select:hover,
  .ndp-header select:hover {
    border-color: #93c5fd !important;
    background-color: #eff6ff !important;
  }

  .calendar-header button,
  .ndp-prev-btn,
  .ndp-next-btn {
    width: 28px !important;
    height: 28px !important;
    min-width: 28px !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 8px !important;
    background: #ffffff !important;
    color: #64748b !important;
    font-size: 15px !important;
    line-height: 1 !important;
    cursor: pointer !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    transition: all 0.15s !important;
    flex-shrink: 0 !important;
  }
  .calendar-header button:hover,
  .ndp-prev-btn:hover,
  .ndp-next-btn:hover {
    background: #eff6ff !important;
    border-color: #93c5fd !important;
    color: #2563eb !important;
  }

  .calendar-week-header,
  .week-header,
  .ndp-week-header {
    display: grid !important;
    grid-template-columns: repeat(7, 1fr) !important;
    margin-bottom: 4px !important;
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
  }
  .calendar-week-header > *,
  .week-header > *,
  .ndp-week-header > * {
    text-align: center !important;
    font-size: 10px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.06em !important;
    color: #94a3b8 !important;
    padding: 4px 0 6px !important;
    background: transparent !important;
    border: none !important;
  }

  .calendar-body,
  .ndp-days {
    display: grid !important;
    grid-template-columns: repeat(7, 1fr) !important;
    gap: 2px !important;
    background: transparent !important;
  }

  .calendar-body > *,
  .calendar-day,
  .ndp-day {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: 32px !important;
    font-size: 12.5px !important;
    font-weight: 400 !important;
    color: #334155 !important;
    border-radius: 8px !important;
    cursor: pointer !important;
    background: transparent !important;
    border: none !important;
    transition: background 0.1s, color 0.1s !important;
    position: relative !important;
  }
  .calendar-body > *:hover,
  .calendar-day:hover,
  .ndp-day:hover {
    background: #eff6ff !important;
    color: #1d4ed8 !important;
  }

  .calendar-body .selected,
  .calendar-day.selected,
  .ndp-day.selected,
  .calendar-body .active,
  .calendar-day.active {
    background: #2563eb !important;
    color: #ffffff !important;
    font-weight: 600 !important;
    border-radius: 8px !important;
  }
  .calendar-body .selected:hover,
  .calendar-day.selected:hover {
    background: #1d4ed8 !important;
  }

  .calendar-body .today,
  .calendar-day.today,
  .ndp-day.today {
    font-weight: 700 !important;
    color: #2563eb !important;
  }
  .calendar-body .today::after,
  .calendar-day.today::after,
  .ndp-day.today::after {
    display: none !important;
  }
  .calendar-body .today:not(.selected),
  .calendar-day.today:not(.selected) {
    border: 1.5px solid #93c5fd !important;
    color: #2563eb !important;
  }
  .calendar-body .today.selected,
  .calendar-day.today.selected {
    background: #2563eb !important;
    color: #ffffff !important;
    border: none !important;
  }

  .calendar-body .disabled,
  .calendar-day.disabled,
  .ndp-day.disabled,
  .calendar-body .other-month,
  .ndp-day.other-month {
    color: #cbd5e1 !important;
    cursor: default !important;
    pointer-events: none !important;
  }
`;

function CalendarStyleInjector() {
  return <style dangerouslySetInnerHTML={{ __html: CALENDAR_OVERRIDES }} />;
}

interface User {
  _id: string
  name: string
  email: string
  phone?: string
  tagnumber?: string
  status: boolean
  both?: boolean
  updatedAt?: string
}

interface UserMilkEntry {
  _id?: string // MongoDB ID from existing entry
  userId: string
  name: string
  todaymilk: string
  todayfit: string
  todaymoney: number
  submitted: boolean
  session?: string
}

interface FormValues {
  entries: UserMilkEntry[]
}

// Validation schema for individual milk entry
const milkEntrySchema = Yup.object().shape({
  todaymilk: Yup.number()
    .min(0.1, 'Milk quantity must be at least 0.1 L')
    .max(1000, 'Milk quantity seems too high')
    .required('Milk quantity is required'),
  todayfit: Yup.number()
    .min(1, 'Fat percentage must be at least 1%')
    .max(10, 'Fat percentage cannot exceed 10%')
    .required('Fat percentage is required')

});

// Main validation schema
const validationSchema = Yup.object().shape({
  entries: Yup.array().of(milkEntrySchema)
});

const Addmilk = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: users, loading: usersLoading, lastFetched } = useSelector((state: RootState) => state.user)
  const { saveLoading, error: milkError, milkEntries, loading: milkLoading } = useSelector((state: RootState) => state.milk)
  const { data: settingData, loading: settingsLoading } = useSelector((state: RootState) => state.siteSettings)

  // Safe date initialization with fallback to avoid library parse errors
  const getSafeDate = () => {
    try {
      const nepaliDate = new ND(new Date());
      const formatted = nepaliDate.format("YYYY-MM-DD");
      return formatted && formatted !== 'Invalid date' ? formatted : '2081-01-01';
    } catch (e) {
      console.warn('Failed to initialize Nepali date, using fallback:', e);
      return '2081-01-01';
    }
  };

  const [date, setDate] = useState<string>(getSafeDate())
  const [selectedFilter, setSelectedFilter] = useState<'morning' | 'night' | 'all'>('morning')
  const [selectedDate, setSelectedDate] = useState<string>(getSafeDate())
  const [submittingUser, setSubmittingUser] = useState<string | null>(null)

  useEffect(() => {
    if (!users || users.length === 0) {
      dispatch(getdata())
    }
  }, [dispatch, users])

  useEffect(() => {
    // Only fetch settings if not already loaded
    if (!settingData) {
      dispatch(getsettingdata());
    }
  }, [dispatch, settingData]);

  // Rate calculations
  const hasSuperAdminUsers = (users || []).some((user: any) => user.role === 'superadmin');
  const rate = settingData?.rate_of_user || 0;
  const superadminrate = settingData?.rate_of_admin || 0;

  useEffect(() => {
    // Only fetch users if data is stale or doesn't exist
    const isDataStale = !lastFetched || Date.now() - (lastFetched || 0) > 5 * 60 * 1000;

    if (((users && users.length) === 0 || isDataStale) && !usersLoading) {
      dispatch(getdata())
    }
  }, [dispatch, users && users.length, usersLoading, lastFetched])

  // Fetch milk entries whenever date or session changes — default is today
  useEffect(() => {
    if (!selectedDate) return;
    const normalisedDate = selectedDate.replace(/-/g, '/');
    const sessionValue = selectedFilter === 'all' ? '' : selectedFilter;
    dispatch(getAllMilk({
      session: sessionValue as 'morning' | 'night' | '',
      startDate: normalisedDate,
      endDate: normalisedDate,
      limit: 1000,
    }));
  }, [dispatch, selectedFilter, selectedDate]);

  // Handle errors
  useEffect(() => {
    if (milkError) {
      toast.error(milkError);
      dispatch(clearError());
    }
  }, [milkError, dispatch]);

  // Create initial form values directly from backend milkEntries (no local filtering)
  const createInitialValues = (): FormValues => {
    const entries: UserMilkEntry[] = (milkEntries || []).map(entry => {
      return {
        _id: entry._id,
        userId: entry.userid,
        name: entry.name,
        todaymilk: entry.todaymilk && entry.todaymilk > 0 ? String(entry.todaymilk) : '',
        todayfit: entry.todayfit && entry.todayfit > 0 ? String(entry.todayfit) : '',
        todaymoney: entry.todaymoney || 0,
        submitted: entry.todaymilk > 0,
        session: entry.session
      };
    });
    return { entries };
  };

  const calculateMoney = (milk: string, fit: string): number => {
    const milkQuantity = parseFloat(milk) || 0;
    const fitPercentage = parseFloat(fit) || 0;
    const currentRate = hasSuperAdminUsers ? Number(superadminrate) : Number(rate);
    // Formula: milk * fat * rate (not divided by 100)
    return milkQuantity * fitPercentage * currentRate;
  };

  const handleSubmitSingle = async (userEntry: UserMilkEntry, setFieldValue: any, index: number) => {
    setSubmittingUser(userEntry.userId);

    try {
      if (!userEntry.todaymilk || !userEntry.todayfit) {
        toast.error(`Please enter both milk quantity and fat percentage for ${userEntry.name}`);
        setSubmittingUser(null);
        return;
      }

      const milkQuantity = parseFloat(userEntry.todaymilk);
      const fitQuantity = parseFloat(userEntry.todayfit);

      if (milkQuantity <= 0) {
        toast.error(`Invalid milk quantity for ${userEntry.name}. Must be greater than 0`);
        setSubmittingUser(null);
        return;
      }

      if (fitQuantity < 1 || fitQuantity > 10) {
        toast.error(`Invalid fat percentage for ${userEntry.name}. Must be between 1 and 10`);
        setSubmittingUser(null);
        return;
      }

      const entryData = {
        userid: userEntry.userId,
        name: userEntry.name,
        todaymilk: milkQuantity,
        todaymoney: userEntry.todaymoney,
        todayfit: fitQuantity,
        session: selectedFilter as 'morning' | 'night'
      };

      let resultAction;
      if (userEntry._id) {
        // Update existing record created by cron job
        resultAction = await dispatch(updateMilk({
          id: userEntry._id,
          updateData: entryData
        }));
      } else {
        // Fallback to save if no ID (though cron should have created it)
        // Since we removed saveMilk from imports, we use updateMilk if possible or log
        console.warn('No existing entry ID found for update. Using updateMilk as fallback if API supports it.');
        resultAction = await dispatch(updateMilk({
          id: '', // This might fail if backend requires ID
          updateData: entryData
        }));
      }

      // Check if the action was fulfilled (successful)
      if (updateMilk.fulfilled.match(resultAction)) {
        // Mark as submitted
        setFieldValue(`entries.${index}.submitted`, true);
        toast.success(`Milk entry updated successfully for ${userEntry.name}!`);
      } else {
        // Handle rejected case
        const errorMessage = resultAction.payload as string || 'Unknown error occurred';
        console.error('Save milk failed:', errorMessage);

        // Check if it might be a false negative (data saved but error returned)
        if (errorMessage.includes('Network error') || errorMessage.includes('timeout')) {
          toast.warning(`Network issue detected for ${userEntry.name}. Please verify the entry.`);
        } else {
          toast.error(`Failed to save milk entry for ${userEntry.name}: ${errorMessage}`);
        }
      }

    } catch (error: any) {
      console.error('Error saving milk entry:', error);
      const errorMessage = error?.message || error?.toString() || 'Please try again.';

      // If it's a network error, suggest checking the data
      if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
        toast.warning(`Network issue for ${userEntry.name}. Please check if the entry was saved and refresh the page.`);
      } else {
        toast.error(`Failed to save milk entry for ${userEntry.name}: ${errorMessage}`);
      }
    } finally {
      setSubmittingUser(null);
    }
  };

  const handleSubmitAll = async (values: FormValues, { setSubmitting, setFieldValue }: any) => {
    setSubmitting(true);

    try {
      const pendingEntries = values.entries.filter(entry =>
        entry.todaymilk && entry.todayfit && !entry.submitted
      );

      if (pendingEntries.length === 0) {
        toast.error('No pending entries to submit. Please enter milk data for at least one user');
        setSubmitting(false);
        return;
      }

      // Submit all entries
      let successCount = 0;
      for (let i = 0; i < pendingEntries.length; i++) {
        const entry = pendingEntries[i];
        const originalIndex = values.entries.findIndex(e => e.userId === entry.userId);

        try {
          const entryData = {
            userid: entry.userId,
            name: entry.name,
            todaymilk: parseFloat(entry.todaymilk),
            todaymoney: entry.todaymoney,
            todayfit: parseFloat(entry.todayfit),
            session: selectedFilter as 'morning' | 'night'
          };

          let resultAction;
          if (entry._id) {
            resultAction = await dispatch(updateMilk({
              id: entry._id,
              updateData: entryData
            }));
          } else {
            // Fallback for missing ID
            resultAction = await dispatch(updateMilk({
              id: '',
              updateData: entryData
            }));
          }

          // Check if the action was fulfilled (successful)
          if (updateMilk.fulfilled.match(resultAction)) {
            // Mark as submitted
            setFieldValue(`entries.${originalIndex}.submitted`, true);
            successCount++;
          } else {
            const errorMessage = resultAction.payload as string || 'Unknown error occurred';
            console.error(`Update milk failed for ${entry.name}:`, errorMessage);
            toast.error(`Failed to update entry for ${entry.name}: ${errorMessage}`);
          }
        } catch (error: any) {
          const errorMessage = error?.message || error?.toString() || 'Unknown error';
          console.error(`Error saving milk entry for ${entry.name}:`, errorMessage);
          toast.error(`Failed to save entry for ${entry.name}: ${errorMessage}`);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully saved ${successCount} milk !`);
      } else if (pendingEntries.length > 0) {
        toast.warning('No entries were saved successfully. Please check your connection and try again.');
      }

    } catch (error) {
      console.error('Error saving milk entries:', error);
      toast.error('Failed to save some milk entries. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Only show loading on initial load if no data exists
  const isInitialLoading = (usersLoading && (!users || users.length === 0)) ||
    (milkLoading && (!milkEntries || milkEntries.length === 0)) ||
    (settingsLoading && !settingData);

  if (isInitialLoading) {
    return <Loading />;
  }

  const initialValues = createInitialValues();


  return (
    <>
      <CalendarStyleInjector />
      <AdminHeader
        title="Add Milk Entry"
        subtitle="Record daily milk collection"
        linkname="Create Records"
        linkto="/admin/create-milk-records"
      />

      <div className="space-y-6">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmitAll}
          enableReinitialize={true}
          key={`${selectedFilter}-${selectedDate}`} // Reset form when filter or date changes
        >
          {({ values, setFieldValue, isSubmitting, errors, touched }) => {
            // Calculate total milk dynamically from current form values
            const totalMilk = values.entries.reduce((sum, entry) => {
              return sum + (parseFloat(entry.todaymilk || '0') || 0);
            }, 0);

            return (
              <div className="space-y-6">
                <div className=" dark:bg-gray-800   w-full overflow-x-auto">
                  <div className="flex  items-center gap-6">
                    {/* Date Picker */}
                    <div className="flex items-center gap-3">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 hidden md:block">Date</Label>
                      <div className="relative w-44">
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                          <Calendar className="w-4 h-4 text-slate-400" />
                        </span>
                        <NepaliDatePicker
                          inputClassName="block w-full h-9 pl-3 pr-10 rounded-lg text-sm bg-white border border-slate-200 text-slate-700 hover:border-blue-400 focus:border-blue-500 outline-none cursor-pointer transition-all"
                          value={date || '2081-01-01'}
                          onChange={(value: string) => {
                            if (value && value !== 'Invalid date') {
                              setDate(value);
                              setSelectedDate(value);
                            }
                          }}
                          options={{ calenderLocale: "ne", valueLocale: "en" } as any}
                        />
                      </div>
                    </div>

                    {/* Session Dropdown */}
                    <div className="flex items-center gap-3">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 hidden md:block">Session</Label>
                      <Select
                        value={selectedFilter}
                        onValueChange={(v) => setSelectedFilter(v as 'morning' | 'night' | 'all')}
                      >
                        <SelectTrigger className="w-36 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">☀️ Morning</SelectItem>
                          <SelectItem value="night">🌙 Night</SelectItem>
                          <SelectItem value="all">☀️🌙 All</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Total Display */}
                    <div className="ml-auto flex items-center gap-2 px-4 py-1.5 text-blue-600 rounded-lg  ">
                      <Milk className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Today's Milk:</span>
                      <span className="text-lg font-black">{totalMilk.toFixed(1)}</span>L
                    </div>
                  </div>
                </div>
                {/* Total Milk Display - Only when superadmin users exist */}


                <Form className="space-y-6">
                  {/* Action Buttons */}

                  {/* Users Milk Entry Form Table */}
                  <div className=" dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                   

                    <div className="overflow-x-auto">
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow className="">
                            <TableHead className="font-semibold w-12">#</TableHead>
                            <TableHead className="font-semibold min-w-32">Name</TableHead>
                            <TableHead className="font-semibold min-w-24 hidden md:table-cell">Session</TableHead>
                            <TableHead className="font-semibold min-w-32">Milk Quantity (L)</TableHead>
                            <TableHead className="font-semibold min-w-32">Fat Percentage (%)</TableHead>
                            <TableHead className="font-semibold min-w-32">Total Money (₹)</TableHead>
                            <TableHead className="font-semibold min-w-32">Status</TableHead>
                            <TableHead className="font-semibold min-w-32">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(milkEntries || []).length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-12">
                                <div className="flex flex-col items-center gap-3">
                                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                                    <Eye className="h-8 w-8 text-gray-400" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-gray-500 font-medium">No milk records found for this date</p>
                                    <p className="text-sm text-gray-400">Backend did not return any records for the selected date and session.</p>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            <FieldArray name="entries">
                              {() => (
                                values.entries.map((entry, index) => {

                                  const isSubmittingThis = submittingUser === entry.userId;
                                  const hasData = entry.todaymilk && entry.todayfit;
                                  const fieldError = errors.entries?.[index] as any;
                                  const fieldTouched = touched.entries?.[index] as any;

                                  return (
                                    <React.Fragment key={entry.userId}>
                                      <TableRow className="hover:bg-gray-50">
                                        <TableCell className="font-medium py-4">{index + 1}</TableCell>
                                        <TableCell className="font-medium py-4">
                                          <div className="font-medium">{entry.name}</div>
                                        </TableCell>
                                        <TableCell className="py-4 hidden  md:table-cell">
                                          <Badge variant="outline" className="text-xs">{entry.session || 'N/A'}</Badge>
                                        </TableCell>
                                        <TableCell className="py-4">
                                          <div className="space-y-1">
                                            <Field
                                              as={Input}
                                              name={`entries.${index}.todaymilk`}
                                              type="number"
                                              step="0.1"
                                              min="0"
                                              placeholder="0.0"
                                              className={`w-full min-w-24 ${fieldError?.todaymilk && fieldTouched?.todaymilk
                                                ? 'border-red-500 focus:border-red-500'
                                                : ''
                                                }`}
                                              disabled={isSubmitting || isSubmittingThis || entry.submitted}
                                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const value = e.target.value;
                                                setFieldValue(`entries.${index}.todaymilk`, value);
                                                // Auto-calculate money
                                                const money = calculateMoney(value, entry.todayfit);
                                                setFieldValue(`entries.${index}.todaymoney`, money);
                                              }}
                                            />
                                            <ErrorMessage
                                              name={`entries.${index}.todaymilk`}
                                              component="div"
                                              className="text-red-500 text-xs"
                                            />
                                          </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                          <div className="space-y-1">
                                            <Field
                                              as={Input}
                                              name={`entries.${index}.todayfit`}
                                              type="number"
                                              step="0.1"
                                              min="1"
                                              max="10"
                                              placeholder="0.0"
                                              className={`w-full min-w-24 ${fieldError?.todayfit && fieldTouched?.todayfit
                                                ? 'border-red-500 focus:border-red-500'
                                                : ''
                                                }`}
                                              disabled={isSubmitting || isSubmittingThis || entry.submitted}
                                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const value = e.target.value;
                                                setFieldValue(`entries.${index}.todayfit`, value);
                                                // Auto-calculate money
                                                const money = calculateMoney(entry.todaymilk, value);
                                                setFieldValue(`entries.${index}.todaymoney`, money);
                                              }}
                                            />
                                            <ErrorMessage
                                              name={`entries.${index}.todayfit`}
                                              component="div"
                                              className="text-red-500 text-xs"
                                            />
                                          </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                          <div className="flex items-center gap-2">
                                            <Badge
                                              variant="secondary"
                                              className={`${entry.todaymoney > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                                            >
                                              ₹{entry.todaymoney.toFixed(2)}
                                            </Badge>
                                            {/* {entry.todaymilk && entry.todayfit && (
                                              <span className="text-xs text-gray-500 hidden sm:inline">
                                                ({parseFloat(entry.todaymilk || '0').toFixed(1)} L * {parseFloat(entry.todayfit || '0').toFixed(1)} * ₹{hasSuperAdminUsers ? superadminrate : rate})
                                              </span>
                                            )} */}
                                          </div>
                                        </TableCell>
                                        <TableCell className="py-4 ">
                                          {entry.submitted ? (
                                            <Badge variant="default" className="bg-green-600 text-white">
                                              Submitted
                                            </Badge>
                                          ) : hasData ? (
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                              Ready
                                            </Badge>
                                          ) : (
                                            <Badge variant="outline" className="text-gray-500">
                                              Pending
                                            </Badge>
                                          )}
                                        </TableCell>
                                        <TableCell className="py-4">
                                          {entry.submitted ? (
                                            <Badge variant="outline" className="text-green-600 border-green-200 block text-center">
                                              ✓ Submitted
                                            </Badge>
                                          ) : (
                                            <Button
                                              type="button"
                                              size="sm"
                                              onClick={() => handleSubmitSingle(entry, setFieldValue, index)}
                                              disabled={!hasData || isSubmitting || isSubmittingThis}
                                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 w-full sm:w-auto"
                                            >
                                              {isSubmittingThis ? (
                                                <>
                                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                                  Saving...
                                                </>
                                              ) : (
                                                <>
                                                  <Save className="w-3 h-3 mr-1" />
                                                  Submit
                                                </>
                                              )}
                                            </Button>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    </React.Fragment>
                                  );
                                })
                              )}
                            </FieldArray>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Submit Button at the bottom */}
                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      disabled={isSubmitting || values.entries.filter(e => e.todaymilk && e.todayfit && !e.submitted).length === 0}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Saving All ...
                        </>
                      ) : (
                        <>
                          <Milk className="w-5 h-5 mr-2" />
                          Submit All Milk ({values.entries.filter(e => e.todaymilk && e.todayfit && !e.submitted).length} users)
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </div>
            );
          }}
        </Formik>
      </div>
    </>
  )
}

export default Addmilk