import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../store/store'
import { getAllMilk, updateMilk, deleteMilk } from '../../../store/slices/milkSlicer'
import { getAllMonths } from "../../../store/slices/monthslicer"
import { getdata } from "../../../store/slices/userSlicer"
import { AdminPDFModal } from './components/AdminPDFModal'
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";

import { Card, CardContent } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog"
import {  getsettingdata} from "../../../store/slices/sitesettingSlicer"

import { 
  ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight, 
  Pencil,
  Trash2
} from "lucide-react"
import { toast } from 'sonner'
import ND from "nepali-date-converter";
import MilkManagementHeader from './components/MilkManagementHeader'
import { useTranslation } from 'react-i18next'

interface FilterParams {
  userid?: string
  monthid?: string
  session?: 'morning' | 'night'   
  page?: number
  limit?: number
  date?: string

}

interface MilkEntry {
  _id: string
  userid: string
  monthid: string
  session: 'morning' | 'night'
  todaymilk: number
  todayfit: number
  todaymoney: number
  createdAt: string
  updatedAt: string
  date:string
  rate:number
}

interface UpdateMilkEntryData {
  userid: string
  name: string
  todaymilk: number
  todayfit: number
  todaymoney: number
  session: 'morning' | 'night'
}

const MilkManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslation()
  const { milkEntries, loading, error, pagination } = useSelector((state: RootState) => state.milk)
    const { data:settingdata, loading:setingloloading, error:settingError,  } = useSelector((state: RootState) => state.siteSettings);
  const { data: usersData } = useSelector((state: RootState) => state.user)
  const users = Array.isArray(usersData) ? usersData : []
  const { months } = useSelector((state: RootState) => state.months)

  const safeNumber = (value: unknown, fallback = 0) => {
    const n = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(n) ? n : fallback
  }

  // Single dynamic rate (no user-type branching)
  const rate = useMemo(() => {
    return safeNumber((settingdata as any)?.rate_of_user, 0)
  }, [settingdata])

  const calculateMoney = (milk: number, fat: number) => {
    // Formula provided: milk × fat × rate (not divided by 100)
    const amount = safeNumber(milk, 0) * safeNumber(fat, 0) * safeNumber(rate, 0)
    return safeNumber(parseFloat(amount.toFixed(2)), 0)
  }

  // Filter states
  const [filters, setFilters] = useState<FilterParams>({
    page: 1,
    limit: 10
  })
  // Safe date initialization
  const getSafeDate = () => {
    try {
      const nepaliDate = new ND(new Date());
      // Use YYYY-MM-DD format with dashes which is more standard
      const formatted = nepaliDate.format("YYYY-MM-DD");
      return formatted && formatted !== 'Invalid date' ? formatted : '2081-01-01';
    } catch (e) {
      console.warn('Failed to initialize Nepali date:', e);
      return '2081-01-01';
    }
  };

  const [date, setDate] = useState(getSafeDate());
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'morning' | 'night'>('all')
  const [showUserReportModal, setShowUserReportModal] = useState(false)
  
  // Update milk entry state
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<MilkEntry | null>(null)
  const [updateData, setUpdateData] = useState<UpdateMilkEntryData>({
    userid: '',
    name: '',
    todaymilk: 0,
    todayfit: 0,
    todaymoney: 0,
    session: 'morning'
  })
  const [updateLoading, setUpdateLoading] = useState(false)

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null)

  useEffect(() => {
    if(!months || months.length === 0)
      dispatch(getAllMonths())
  }, [dispatch])

  useEffect(() => {
    if(!usersData || usersData.length === 0)
      dispatch(getdata())
  }, [dispatch, usersData])

  // Ensure settings are loaded (must be before any conditional returns)
  useEffect(() => {
    if (settingdata == null) {
      dispatch(getsettingdata())
    }
  }, [dispatch, settingdata])

  // Fetch milk data with filters
  const fetchMilkData = () => {
    const params: any = { ...filters }
    if (selectedFilter !== 'all') {
      params.session = selectedFilter
    }
    if(date){
      params.date = date;
    }
    dispatch(getAllMilk(params))
  }

  useEffect(() => {
    fetchMilkData()
  }, [filters, selectedFilter, date])

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key as keyof FilterParams]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10
    })
    setSelectedFilter('all')
  }

  // Open update modal with selected entry
  const handleOpenUpdateModal = (entry: MilkEntry) => {
    setSelectedEntry(entry)
    const user = users.find((u: any) => u._id === entry.userid)

    const initialMilk = safeNumber(entry.todaymilk, 0)
    const initialFat = safeNumber(entry.todayfit, 0)
    const initialMoney = calculateMoney(initialMilk, initialFat)
    
    setUpdateData({
      userid: entry.userid,
      name: user?.name || 'Unknown User',
      todaymilk: initialMilk,
      todayfit: initialFat,
      todaymoney: initialMoney,
      session: entry.session
    })
    setUpdateModalOpen(true)
  }

  // Handle input changes for update modal
  const handleUpdateInputChange = (field: 'todaymilk' | 'todayfit', value: number) => {
    const nextValue = safeNumber(value, 0)

    setUpdateData(prev => {
      const nextMilk = field === 'todaymilk' ? nextValue : safeNumber(prev.todaymilk, 0)
      const nextFat = field === 'todayfit' ? nextValue : safeNumber(prev.todayfit, 0)
      return {
        ...prev,
        [field]: nextValue,
        todaymoney: calculateMoney(nextMilk, nextFat)
      }
    })
  }

  // If settings load after modal opens, recompute Amount from formula
  useEffect(() => {
    if (!updateModalOpen) return
    setUpdateData(prev => ({
      ...prev,
      todaymoney: calculateMoney(prev.todaymilk, prev.todayfit)
    }))
  }, [updateModalOpen, rate])

  // Update milk entry
  const handleUpdateMilkEntry = async () => {
    if (!selectedEntry) return
    
    try {
      setUpdateLoading(true)
      
      // Use Redux thunk to update milk entry
      const result = await dispatch(updateMilk({
        id: selectedEntry._id,
        updateData
      })).unwrap()
      
      // Close modal and show success message
      setUpdateModalOpen(false)
      toast.success(t('milkManagement.updateSuccess'))
      
      // Refresh data
      fetchMilkData()
    } catch (error: any) {
      console.error('Error updating milk entry:', error)
      toast.error(typeof error === 'string' ? error : t('milkManagement.updateFailed'))
    } finally {
      setUpdateLoading(false)
    }
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
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  // Fixed formatNepaliNumber function to handle non-numeric inputs safely
  const formatNepaliNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '०'
    
    const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
    return num.toString().replace(/\d/g, (digit) => nepaliDigits[parseInt(digit)] || digit)
  }

  const filteredEntries = useMemo(() => {
    return Array.isArray(milkEntries) ? milkEntries : []
  }, [milkEntries])

  const selectedMonth = filters.monthid ? months?.find(m => m._id === filters.monthid) : null

  if (loading && (!milkEntries || milkEntries.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">{t('milkManagement.loading')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">{t('milkManagement.errorPrefix')}: {error}</div>
      </div>
    )
  }

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteMilk(id)).unwrap();
      toast.success('Milk entry deleted successfully');
      fetchMilkData();
    } catch (error) {
      console.error('Error deleting milk entry:', error);
      toast.error('Error deleting milk entry');
    }
  }

  // Open delete confirmation modal
  const openDeleteModal = (id: string) => {
    setDeleteEntryId(id);
    setDeleteModalOpen(true);
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (deleteEntryId) {
      await handleDelete(deleteEntryId);
      setDeleteEntryId(null);
      setDeleteModalOpen(false);
    }
  }

  // Cancel delete
  const cancelDelete = () => {
    setDeleteEntryId(null);
    setDeleteModalOpen(false);
  }

const nepalimonth =[
  { label: 0, monthname: "Baisakh" },
  { label: 1, monthname: "Jeth" },
  { label: 2, monthname: "Ashadh" },
  { label: 3, monthname: "Shrawan" },
  { label: 4, monthname: "Bhadra" },
  { label: 5, monthname: "Ashoj" },
  { label: 6, monthname: "Kartik" },
  { label: 7, monthname: "Mangsir" },
  { label: 8, monthname: "Poush" },
  { label: 9, monthname: "Magh" },
  { label: 10, monthname: "Falgun" },
  { label: 11, monthname: "Chaitra" }
];


  return (
    <>
    <div className="">
      <div className='relative'>
      <MilkManagementHeader
        filters={filters}
        handleFilterChange={handleFilterChange}
        handleResetFilters={handleResetFilters}
        handleExportCSV={handleExportCSV}
        fetchMilkData={fetchMilkData}
        data={users}
        date={date}
        setDate={setDate}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
      />
      </div>
      
      {/* Results Summary */}
  

      {/* Data Table */}
      <Card className="shadow-sm">
        <CardContent className="p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
            <div className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-0">{t('milkManagement.titleRecords')}</div>
            <div className="text-xs sm:text-sm text-gray-500">
              {t('milkManagement.showingRecords', { shown: formatNepaliNumber(filteredEntries.length), total: formatNepaliNumber(pagination?.totalItems || 0) })}
            </div>
          </div>
          
          {filteredEntries.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-300 p-8 sm:p-12 text-center bg-gray-50">
              <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-gray-100 rounded-full">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700">No Data Found</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">No milk collection records available for the selected filters.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="py-2 sm:py-3 text-xs sm:text-sm font-semibold">Index</TableHead>
                    <TableHead className="py-2 sm:py-3 text-xs sm:text-sm font-semibold">Date</TableHead>
                    <TableHead className="py-2 sm:py-3 text-xs sm:text-sm font-semibold">User</TableHead>
                    <TableHead className="py-2 sm:py-3 text-xs sm:text-sm font-semibold">Session</TableHead>
                    <TableHead className="py-2 sm:py-3 text-xs sm:text-sm font-semibold">Milk</TableHead>
                    <TableHead className="py-2 sm:py-3 text-xs sm:text-sm font-semibold">Fat%</TableHead>
                    <TableHead className="py-2 sm:py-3 text-xs sm:text-sm font-semibold">Amount</TableHead>
                    <TableHead className="py-2 sm:py-3 text-xs sm:text-sm font-semibold w-[60px] sm:w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry: any) => {
                  const user = users.find((u: any) => u._id === entry.userid)
                  const month = nepalimonth?.find((m: any) => m.label === parseInt(entry.monthid))
                  
                  
                  return (
                    <TableRow key={entry._id} className="text-xs sm:text-sm hover:bg-gray-50">
                      <TableCell className="py-1.5 sm:py-2.5 font-medium whitespace-nowrap">
                        {filteredEntries.indexOf(entry) + 1}
                      </TableCell>
                      <TableCell className="py-1.5 sm:py-2.5 font-medium whitespace-nowrap">
                        {formatDate(entry.date)}
                      </TableCell>
                      <TableCell className="py-1.5 sm:py-2.5 max-w-[80px] sm:max-w-none truncate">
                        {user?.name || t('milkManagement.unknownUser')}
                      </TableCell>
                      <TableCell className="py-1.5 sm:py-2.5 capitalize whitespace-nowrap">
                       {entry.session || "NA"} 
                        </TableCell>
                      <TableCell className="py-1.5 sm:py-2.5 text-blue-600 font-semibold whitespace-nowrap">
                        {formatNepaliNumber(entry.todaymilk || 0)}
                      </TableCell>
                      <TableCell className="py-1.5 sm:py-2.5 text-orange-600 whitespace-nowrap">
                        {formatNepaliNumber(entry.todayfit || 0)}%
                      </TableCell>
                      <TableCell className="py-1.5 sm:py-2.5 text-green-600 font-semibold whitespace-nowrap">
                        Rs.{formatNepaliNumber(entry.todaymoney || 0)}
                      </TableCell>
                      <TableCell className="py-1.5 sm:py-2.5">
                        <div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-blue-600"
                          onClick={() => handleOpenUpdateModal(entry)}
                        >
                          <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                          <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-600"
                          onClick={() => openDeleteModal(entry._id)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
</div>
                      </TableCell>
                    </TableRow>
                  )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-2">
              <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
                Page {formatNepaliNumber(pagination.currentPage)} of {formatNepaliNumber(pagination.totalPages)}
                <span className="hidden sm:inline">{' • '} {formatNepaliNumber(pagination.totalItems)} total items</span>
              </div>
              
              <div className="flex items-center justify-center sm:justify-end space-x-1 sm:space-x-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.currentPage <= 1}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                >
                  <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                
                {/* Page Numbers */}
                {pagination.totalPages && Array.from({ length: Math.min(3, pagination.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 2) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 1) {
                    pageNum = pagination.totalPages - 2 + i;
                  } else {
                    pageNum = pagination.currentPage - 1 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="h-7 sm:h-8 min-w-[28px] sm:min-w-[36px] text-xs sm:text-sm"
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
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                >
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                >
                  <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User PDF Modal */}
      {users.length > 0 && months && (
        <AdminPDFModal
          isOpen={showUserReportModal}
          onClose={() => setShowUserReportModal(false)}
          months={months || []}
        />
      )}
      
      {/* Update Milk Entry Modal */}
      <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
        <DialogContent className="sm:max-w-[425px] max-w-[95vw] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">Update Milk Entry</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-2 sm:py-4">
            {selectedEntry && (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-2">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500">{t('milkManagement.user')}</p>
                    <p className="text-sm sm:text-base font-medium">{users.find((u: any) => u._id === selectedEntry.userid)?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500">{t('milkManagement.date')}</p>
                    <p className="text-sm sm:text-base font-medium">{formatDate(selectedEntry.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500">{t('milkManagement.session')}</p>
                    <p className="text-sm sm:text-base font-medium">{selectedEntry.session === 'morning' ? t('milkManagement.morning') : t('milkManagement.night')}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500">{t('monthManagement.month')}</p>
                    <p className="text-sm sm:text-base font-medium">
                      {months?.find((m: any) => m._id === selectedEntry.monthid)?.month} 
                      {' '} 
                      {months?.find((m: any) => m._id === selectedEntry.monthid)?.year}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="milk" className="text-xs sm:text-sm">{t('milkManagement.milk')} (Liters)</Label>
                  <Input
                    id="milk"
                    type="number"
                    step="0.01"
                    value={updateData.todaymilk}
                    onChange={(e) => handleUpdateInputChange('todaymilk', safeNumber(e.target.value, 0))}
                    className="text-sm sm:text-base h-8 sm:h-10"
                  />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="fat" className="text-xs sm:text-sm">{t('milkManagement.fat')}</Label>
                  <Input
                    id="fat"
                    type="number"
                    step="0.1"
                    value={updateData.todayfit}
                    onChange={(e) => handleUpdateInputChange('todayfit', safeNumber(e.target.value, 0))}
                    className="text-sm sm:text-base h-8 sm:h-10"
                  />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="money" className="text-xs sm:text-sm">{t('milkManagement.amount')}</Label>
                  <Input
                    id="money"
                    type="number"
                    value={updateData.todaymoney}
                    readOnly
                    disabled
                    className="text-sm sm:text-base h-8 sm:h-10"
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter className="sm:justify-end gap-2 mt-2">
            <Button 
              variant="outline" 
              onClick={() => setUpdateModalOpen(false)}
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleUpdateMilkEntry} 
              disabled={updateLoading}
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              {updateLoading ? (
                <>
                  <div className="animate-spin mr-2 h-3 w-3 sm:h-4 sm:w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  {t('milkManagement.updating')}
                </>
              ) : (
                t('milkManagement.updateEntry')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteModalOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title={t('milkManagement.confirmDeleteTitle')}
        description={t('milkManagement.confirmDeleteMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
    </div>
    </>


  )
}

export default MilkManagement
