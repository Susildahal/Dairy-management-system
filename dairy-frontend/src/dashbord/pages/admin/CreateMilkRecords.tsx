import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../store/store'
import { getdata } from '../../../store/slices/userSlicer'
import { createMilkRecords } from '../../../store/slices/milkSlicer'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import AdminHeader from '@/dashbord/common/AdminHeader'
import Loading from '@/dashbord/ui/Loading'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { NepaliDatePicker } from 'nepali-datepicker-reactjs'
import 'nepali-datepicker-reactjs/dist/index.css'
import ND from 'nepali-date-converter'
import { Moon, Users, Milk, CheckCircle2, AlertCircle, Plus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"


// ─── Calendar CSS overrides (same as settings page) ─────────────────────────
const CALENDAR_CSS = `
  .nepali-datepicker-wrapper, .nepali-datepicker { position: relative; width: 100%; }
  .nepali-datepicker-wrapper input, .nepali-datepicker input {
    width: 100% !important; height: 36px !important;
    padding-left: 12px !important; padding-right: 36px !important;
    border-radius: 8px !important; border: 1px solid #e2e8f0 !important;
    background: #ffffff !important; font-size: 13px !important;
    font-weight: 500 !important; color: #334155 !important;
    font-family: inherit !important; outline: none !important;
    cursor: pointer !important; transition: border-color .15s !important;
  }
  .nepali-datepicker-wrapper input:hover, .nepali-datepicker input:hover
    { border-color: #60a5fa !important; }
  .nepali-datepicker-wrapper input:focus, .nepali-datepicker input:focus
    { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,.1) !important; }
  .calendar-container, .nepali-date-picker-calendar, .ndp-calendar {
    position: absolute !important; top: calc(100% + 6px) !important;
    left: 0 !important; z-index: 9999 !important; width: 280px !important;
    background: #ffffff !important; border: 1px solid #e2e8f0 !important;
    border-radius: 12px !important; box-shadow: 0 10px 40px rgba(0,0,0,.12) !important;
    padding: 14px !important; font-family: inherit !important; overflow: hidden !important;
  }
  .calendar-header, .ndp-header {
    display: flex !important; align-items: center !important;
    justify-content: space-between !important; margin-bottom: 12px !important;
  }
  .calendar-header select, .ndp-header select, .ndp-month-select, .ndp-year-select {
    height: 30px !important; padding: 0 24px 0 8px !important;
    border: 1px solid #e2e8f0 !important; border-radius: 8px !important;
    font-size: 13px !important; font-weight: 600 !important; cursor: pointer !important;
    appearance: none !important; -webkit-appearance: none !important; outline: none !important;
  }
  .calendar-body > *, .calendar-day, .ndp-day {
    display: flex !important; align-items: center !important; justify-content: center !important;
    height: 32px !important; font-size: 12.5px !important; border-radius: 8px !important;
    cursor: pointer !important; transition: background .1s !important;
  }
  .calendar-body > *:hover, .calendar-day:hover, .ndp-day:hover
    { background: #eff6ff !important; color: #1d4ed8 !important; }
  .calendar-body .selected, .calendar-day.selected, .ndp-day.selected
    { background: #2563eb !important; color: #ffffff !important; font-weight: 600 !important; }
`

// ─── Safe Nepali date helper ─────────────────────────────────────────────────
const getSafeDate = () => {
  try {
    const nd = new ND(new Date())
    const f = nd.format('YYYY-MM-DD')
    return f && f !== 'Invalid date' ? f : '2081-01-01'
  } catch {
    return '2081-01-01'
  }
}

// ─── Component ───────────────────────────────────────────────────────────────
type Session = 'morning' | 'night'

interface User {
  _id: string
  name: string
  status: boolean
  both?: boolean
  tagnumber?: string
  phone?: string
}

export default function CreateMilkRecords() {
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslation()
  const { data: users, loading: usersLoading } = useSelector((s: RootState) => s.user)

  const [date, setDate] = useState<string>(getSafeDate())
  const [session, setSession] = useState<Session>('morning')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState<{ created: number; skipped: any[] } | null>(null)

  // Fetch users once
  useEffect(() => {
    if (!users || users.length === 0) dispatch(getdata())
  }, [dispatch])

  // Clear selection when session changes
  useEffect(() => {
    setSelectedIds([])
    setResult(null)
  }, [session, date])

  // Filtered list based on session
  const eligibleUsers: User[] = ((users || []) as User[]).filter(u => {
    if (!u.status) return false
    if (session === 'night' && !u.both) return false
    return true
  })

  const allSelected = eligibleUsers.length > 0 && selectedIds.length === eligibleUsers.length

  const toggleUser = (id: string) =>
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )

  const toggleAll = () =>
    setSelectedIds(allSelected ? [] : eligibleUsers.map(u => u._id))

  const handleCreate = async () => {
    if (selectedIds.length === 0) {
      toast.error(t('createMilkRecords.selectAtLeastOneUser'))
      return
    }
    if (!date) {
      toast.error(t('createMilkRecords.selectDate'))
      return
    }
    setCreating(true)
    try {
      const action = await dispatch(
        createMilkRecords({ userIds: selectedIds, date, session })
      )
      if (createMilkRecords.fulfilled.match(action)) {
        const { created = [], skipped = [] } = action.payload as any
        setResult({ created: created.length, skipped })
        toast.success(t('createMilkRecords.createdSuccessfully', { count: created.length }))
        setSelectedIds([])
      } else {
        const msg = (action.payload as string) || t('createMilkRecords.failedCreate')
        toast.error(msg)
      }
    } finally {
      setCreating(false)
    }
  }

  if (usersLoading && (!users || users.length === 0)) return <Loading />

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CALENDAR_CSS }} />

      <AdminHeader
        title={t('createMilkRecords.title')}
        subtitle={t('createMilkRecords.subtitle')}
        linkname={t('createMilkRecords.linkname')}
        linkto="/admin/milk"
      />

      {/* ── Top Filter Bar ─────────────────────────────────────────────── */}
      <div className="  mb-6">
        <div className="flex items-center gap-6">
          {/* Date */}
          <div className="flex flex-col  gap-3">
           
            <Label className="text-xs font-bold text-gray-500  uppercase tracking-wider shrink-0">
              {t('createMilkRecords.date')}
            </Label>
            <div className="relative w-44">
              {/* <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <Calendar className="w-4 h-4 text-slate-400" />
              </span> */}
              <NepaliDatePicker
                inputClassName="block w-full h-9 pl-3 pr-10 rounded-lg text-sm bg-white border border-slate-200 text-slate-700 hover:border-blue-400 focus:border-blue-500 outline-none cursor-pointer transition-all"
                value={date}
                onChange={(v: string) => { if (v && v !== 'Invalid date') setDate(v) }}
                options={{ calenderLocale: 'ne', valueLocale: 'en' } as any}
              />
            </div>
          </div>

          {/* Session */}
          <div className="flex  flex-col  gap-3">
            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">
              {t('createMilkRecords.session')}
            </Label>
            <Select value={session} onValueChange={v => setSession(v as Session)}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">☀️ {t('createMilkRecords.morning')}</SelectItem>
                <SelectItem value="night">🌙 {t('createMilkRecords.night')}</SelectItem>
              </SelectContent>  
            </Select>
          </div>

          {/* Summary badges */}
          <div className="ml-auto md:flex hidden  items-center gap-3">
       
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-xs">
              <Users className="w-3 h-3 mr-1" />
              {t('createMilkRecords.eligibleUsers', { count: eligibleUsers.length })}
            </Badge>
            {selectedIds.length > 0 && (
              <Badge className="bg-blue-600 text-white text-xs">
                {t('createMilkRecords.selected', { count: selectedIds.length })}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* ── Result Banner ──────────────────────────────────────────────── */}
      {result && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-xl p-4 flex flex-wrap items-start gap-4">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-green-700 dark:text-green-400">
              {t('createMilkRecords.recordsCreated', { count: result.created })}
            </p>
            {result.skipped.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {t('createMilkRecords.skipped', { count: result.skipped.length })}
                </p>
                {result.skipped.map((s: any, i: number) => (
                  <p key={i} className="text-xs text-gray-500 pl-4">
                    • {s.name} — {s.reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── User Table ─────────────────────────────────────────────────── */}
      <div className=" dark:bg-gray-800  dark:border-gray-700  overflow-hidden">
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-3  dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            {/* Select-all checkbox */}
            <Checkbox
              id="select-all"
              checked={allSelected}
              onCheckedChange={toggleAll}
              className="mr-2"
            />
            <Label htmlFor="select-all" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
              {t('createMilkRecords.selectAll')}
            </Label>
          </div>
          {/* <Button
            onClick={handleCreate}
            disabled={creating || selectedIds.length === 0}
            className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5"
          >
            {creating ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2" /> Creating...</>
            ) : (
              <><Plus className="w-4 h-4 mr-2" /> Create Records ({selectedIds.length})</>
            )}
          </Button> */}
        </div>

        {eligibleUsers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
            <Milk className="w-10 h-10" />
            <p className="font-semibold">
              {session === 'night'
                ? t('createMilkRecords.noNightUsers')
                : t('createMilkRecords.noActiveUsers')}
            </p>
            <p className="text-sm">
              {session === 'night'
                ? t('createMilkRecords.noNightUsersHint')
                : t('createMilkRecords.noActiveUsersHint')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {eligibleUsers.map((user, i) => {
              const checked = selectedIds.includes(user._id)
              return (
                <label
                  key={user._id}
                  htmlFor={`user-${user._id}`}
                  className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors ${
                    checked
                      ? 'bg-blue-50 dark:bg-blue-900/10'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                  }`}
                >
                  <Checkbox
                    id={`user-${user._id}`}
                    checked={checked}
                    onCheckedChange={() => toggleUser(user._id)}
                    className="shrink-0 mr-2"
                  />

                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                    checked ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name + phone */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                    <p className="text-xs text-slate-400">{(user as any).phone || t('createMilkRecords.noPhone')}</p>
                  </div>

                  {/* Tag */}
                  {user.tagnumber && (
                    <Badge variant="outline" className="text-[10px] font-bold border-slate-200 hidden sm:flex">
                      #{user.tagnumber}
                    </Badge>
                  )}

                  {/* Night badge */}
                  {user.both && (
                    <Badge variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-600 border-indigo-200 hidden md:flex">
                      <Moon className="w-2.5 h-2.5 mr-1" /> {t('createMilkRecords.night')}
                    </Badge>
                  )}

                  {/* Index */}
                  <span className="text-xs font-mono text-slate-300 shrink-0 w-6 text-right">{i + 1}</span>
                </label>
              )
            })}
          </div>
        )}

        {/* Footer */}
        {eligibleUsers.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
            <span className="text-xs text-gray-500">
              {t('createMilkRecords.selectedOf', { selected: selectedIds.length, total: eligibleUsers.length })}
            </span>
            <Button
              onClick={handleCreate}
              disabled={creating || selectedIds.length === 0}
              className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5"
            >
              {creating ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2" /> {t('createMilkRecords.creating')}</>
              ) : (
                <><Plus className="w-4 h-4 mr-2" /> {t('createMilkRecords.createRecords', { count: selectedIds.length })}</>
              )}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
