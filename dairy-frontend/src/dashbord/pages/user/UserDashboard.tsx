import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../store/store'
import { getAllMilk, clearMilkEntries } from '../../../store/slices/milkSlicer'
import { getAllMonths } from "../../../store/slices/monthslicer"
import { getdata } from "../../../store/slices/userSlicer"
import { AdminPDFModal } from '../admin/components/AdminPDFModal'
import { useAuth } from '../../../hooks/useAuth'
import {Header} from '../../common/Header'
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Label } from "../../../components/ui/label"
import {  FileText, RotateCcw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'
interface FilterParams {
  userid?: string
  monthid?: string
  session?: 'morning' | 'night'
  page?: number
  limit?: number
}


const UserDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { milkEntries, loading, error, pagination } = useSelector((state: RootState) => state.milk)
  const { data } = useSelector((state: RootState) => state.user)
  const { months } = useSelector((state: RootState) => state.months)
  const { user } = useAuth() // Get authenticated user from useAuth hook
  const location = useLocation()
  // get current path from react-router
  const currentPath = location.pathname // e.g. "/dashboard/user"
  const currentFullPath = location.pathname + location.search + location.hash // includes query and hash

  // optional: keep in state to react to changes
  const [currentRoute, setCurrentRoute] = useState(location.pathname)
  useEffect(() => {
    setCurrentRoute(location.pathname)
  }, [location.pathname])
  console.log('Current full path:', currentFullPath)

  // example: log when path changes
  useEffect(() => {
    console.log('Current path:', currentPath)
  }, [currentPath])
  // Filter states
  const [filters, setFilters] = useState<FilterParams>(
    user ? {
     page: 1,
      limit: 10
    } : {
      page: 1, 
      limit: 10
    }
  )
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'morning' | 'night'>('all')
  const [showUserReportModal, setShowUserReportModal] = useState(false)
  const [hasAppliedFilter, setHasAppliedFilter] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    if(!months || months.length === 0)
      dispatch(getAllMonths())
  }, [dispatch])

  useEffect(() => {
    if(!data || data.length === 0)
      dispatch(getdata())
  }, [dispatch])

  // Fetch milk data with filters — only when a filter has been explicitly applied
  const fetchMilkData = () => {
    if (!hasAppliedFilter) return
    const params: any = { ...filters }
    if (selectedFilter !== 'all') {
      params.session = selectedFilter
    }
    dispatch(getAllMilk(params))
  }

  useEffect(() => {
    if (hasAppliedFilter) fetchMilkData()
  }, [filters, selectedFilter, hasAppliedFilter])

  // Handle filter changes — mark filter as applied on first meaningful selection
  const handleFilterChange = (key: keyof FilterParams, value: any) => {
    setHasAppliedFilter(true)
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }))
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  // Also mark applied when session filter changes
  const handleSessionChange = (value: 'all' | 'morning' | 'night') => {
    setHasAppliedFilter(true)
    setSelectedFilter(value)
  }

  // Reset all filters and clear table
  const handleResetFilters = () => {
    setFilters({ page: 1, limit: 10 })
    setSelectedFilter('all')
    setHasAppliedFilter(false)
    dispatch(clearMilkEntries())
  }

  // Export to CSV
  const handleExportCSV = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value))
      }
    })
    if (selectedFilter !== 'all') {
      params.append('session', selectedFilter)
    }
    params.append('export', 'csv')
    
    window.open(`${process.env.VITE_API_BASE_URL}/milk/allmilk?${params.toString()}`, '_blank')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language && i18n.language.startsWith('np') ? 'ne-NP' : 'en-GB')
  }

  // Fixed formatNepaliNumber function to handle non-numeric inputs safely
  const formatNepaliNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '०'
    
    const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
    return num.toString().replace(/\d/g, (digit) => nepaliDigits[parseInt(digit)] || digit)
  }

  const filteredEntries = useMemo(() => {
    return milkEntries || []
  }, [milkEntries])

  const selectedMonth = filters.monthid ? months?.find(m => m._id === filters.monthid) : null

  if (loading && (!milkEntries || milkEntries.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">{t('userDashboard.loadingMilkData')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">{t('userDashboard.errorPrefix')}: {error}</div>
      </div>
    )
  }

  return (
    <>

    <div className="container mx-auto p-4 space-y-4">
      
      <div className="flex justify-between items-center border-b pb-3">
        <div>
          <h1 className="text-2xl font-bold">{t('userDashboard.title')}</h1>
        </div>
        <Button onClick={() => setShowUserReportModal(true)} variant="outline" className='cursor-pointer' size="sm">
          <FileText className="w-4 h-4 mr-2" />
          {t('userDashboard.pdfReports')}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{t('userDashboard.filters')}</h2>
          <Button onClick={handleResetFilters} variant="ghost" size="sm">
            <RotateCcw className="w-4 h-4 mr-1" />
            {t('userDashboard.reset')}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* User Filter */}
          <div className="space-y-1">
            <Label className="text-sm">{t('userDashboard.user')}</Label>
            <Select value={filters.userid || 'all'} onValueChange={(value) => handleFilterChange('userid', value === 'all' ? undefined : value)}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder={t('userDashboard.allUsers')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('userDashboard.allUsers')}</SelectItem>
                {data?.filter((u: any) => u.role === 'user').map((u: any) => (
                  <SelectItem key={u._id} value={u._id}>
                    {u.name} {u.tagnumber ? `(${u.tagnumber})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month Filter */}
          <div className="space-y-1">
            <Label className="text-sm">{t('userDashboard.month')}</Label>
            <Select value={filters.monthid || 'all'} onValueChange={(value) => handleFilterChange('monthid', value === 'all' ? undefined : value)}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder={t('userDashboard.month')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('userDashboard.allMonths')}</SelectItem>
                {months?.map((month: any) => (
                  <SelectItem key={month._id} value={month._id}>
                    {month.month} {month.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Session Filter */}
          <div className="space-y-1">
            <Label className="text-sm">{t('userDashboard.session')}</Label>
              <Select value={selectedFilter} onValueChange={handleSessionChange}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('userDashboard.allSessions')}</SelectItem>
                <SelectItem value="morning">{t('userDashboard.morning')}</SelectItem>
                <SelectItem value="night">{t('userDashboard.night')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Records per page */}
          <div className="space-y-1">
            <Label className="text-sm">{t('userDashboard.recordsPerPage')}</Label>
            <Select value={String(filters.limit)} onValueChange={(value) => handleFilterChange('limit', parseInt(value))}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary & Table — only when a filter has been applied */}
      {!hasAppliedFilter ? (
        <div className="bg-white rounded border flex flex-col items-center justify-center py-16 text-center text-gray-400 space-y-3">
          <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          <p className="text-base font-medium text-gray-500">{t('userDashboard.selectFilterTitle')}</p>
          <p className="text-sm text-gray-400">{t('userDashboard.selectFilterSubtitle')}</p>
        </div>
      ) : (
        <>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded border text-center">
          <div className="text-xl font-bold">{formatNepaliNumber(pagination?.totalItems || 0)}</div>
          <div className="text-xs text-gray-600">{t('userDashboard.totalRecords')}</div>
        </div>
        <div className="bg-white p-3 rounded border text-center">
          <div className="text-xl font-bold text-green-600">
            {formatNepaliNumber(
              Math.round(filteredEntries.reduce((sum, entry) => sum + (entry.todaymilk || 0), 0) * 100) / 100
            )}
          </div>
          <div className="text-xs text-gray-600">{t('userDashboard.totalMilk')}</div>
        </div>
        <div className="bg-white p-3 rounded border text-center">
          <div className="text-xl font-bold text-blue-600">
            {formatNepaliNumber(
              Math.round(filteredEntries.reduce((sum, entry) => sum + (entry.todaymoney || 0), 0) * 100) / 100
            )}
          </div>
          <div className="text-xs text-gray-600">{t('userDashboard.totalAmount')}</div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded border">
        <div className="p-3 border-b">
          <h2 className="font-semibold">{t('userDashboard.records')}</h2>
          <p className="text-xs text-gray-600">
            {t('userDashboard.showingRecords', { shown: formatNepaliNumber(filteredEntries.length), total: formatNepaliNumber(pagination?.totalItems || 0) })}
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('userDashboard.date')}</TableHead>
                <TableHead>{t('userDashboard.user')}</TableHead>
                <TableHead>{t('userDashboard.session')}</TableHead>
                <TableHead>{t('userDashboard.milk')}</TableHead>
                <TableHead>{t('userDashboard.fatPercent')}</TableHead>
                <TableHead>{t('userDashboard.amount')}</TableHead>
                <TableHead>{t('userDashboard.month')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry: any) => {
                const month = months?.find((m: any) => m._id === entry.monthid)
                
                return (
                  <TableRow key={entry._id}>
                    <TableCell className="font-medium">
                      {formatDate(entry.date)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {data?.find((u: any) => u._id === entry.userid)?.name || entry.user?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.session === 'morning' ? 'default' : 'secondary'} className="text-xs">
                        {entry.session === 'morning' ? t('userDashboard.morning') : t('userDashboard.night')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatNepaliNumber(entry.todaymilk || 0)}
                    </TableCell>
                    <TableCell>
                      {formatNepaliNumber(entry.todayfit || 0)}%
                    </TableCell>
                    <TableCell className="font-semibold">
                      Rs. {formatNepaliNumber(entry.todaymoney || 0)}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {month?.month} {month?.year}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t">
            <div className="text-xs text-gray-600">
              {t('userDashboard.pageOf', { current: formatNepaliNumber(pagination.currentPage), total: formatNepaliNumber(pagination.totalPages) })}
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage <= 1}
              >
                <ChevronsLeft className="h-3 w-3" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>      
              
              {/* Page Numbers */}
              {pagination.totalPages && Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-7 h-7 p-0 text-xs"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                <ChevronsRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
      </> 
      )}

      {/* Admin PDF Modal */}
      {months && (
        <AdminPDFModal
          isOpen={showUserReportModal}
          onClose={() => setShowUserReportModal(false)}
          months={months || []}
        />
      )}
    </div>
    </>
  )
}

export default UserDashboard
