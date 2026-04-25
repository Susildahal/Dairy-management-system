import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FileText, AlertCircle } from 'lucide-react'
import { generateUserMonthlyPDF } from '../utils/pdfUtils'
import { getAllMilk } from '../../../../store/slices/milkSlicer'
import { AppDispatch } from '../../../../store/store'

interface UserPDFModalProps {
  isOpen: boolean
  onClose: () => void
  user: any       // single logged-in user object
  months: any[]
}

export const UserPDFModal: React.FC<UserPDFModalProps> = ({
  isOpen,
  onClose,
  user,
  months,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [selectedMonth, setSelectedMonth] = useState('')
  const [loadingData, setLoadingData] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')

  const showMessage = (message: string, type: 'success' | 'error' | 'info') => {
    setStatusMessage(message)
    setMessageType(type)
    setTimeout(() => setStatusMessage(''), 5000)
  }

  const handleGeneratePDF = async () => {
    if (!selectedMonth) {
      showMessage('Please select a month', 'error')
      return
    }
    try {
      setLoadingData(true)
      showMessage('Fetching data and generating PDF...', 'info')

      const response = await dispatch(getAllMilk({
        userid: user._id,
        monthid: selectedMonth,
        limit: 999999,
      }))

      if (response.payload && (response.payload as any).data) {
        const userData = (response.payload as any).data
        if (userData.length === 0) {
          showMessage('No data found for selected month', 'error')
          return
        }
        const month = months.find((m: any) => m._id === selectedMonth)
        await generateUserMonthlyPDF(userData, user?.name || 'Unknown User', month)
        showMessage('PDF downloaded successfully!', 'success')
      } else {
        showMessage('No data returned from server', 'error')
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      showMessage('Error generating PDF. Please try again.', 'error')
    } finally {
      setLoadingData(false)
    }
  }

  const handleClose = () => {
    setSelectedMonth('')
    setStatusMessage('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-md my-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-blue-700">
              Download My Report
            </CardTitle>
            <Button onClick={handleClose} variant="outline" size="sm" className="rounded-full h-8 w-8 p-0">
              ✕
            </Button>
          </div>
          <p className="text-gray-600 text-sm">
            Generating report for <span className="font-semibold text-gray-800">{user?.name}</span>
          </p>
        </CardHeader>

        <CardContent className="space-y-5 pt-4">
          {/* Month Selection */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Select Month *</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a month" />
              </SelectTrigger>
              <SelectContent className="max-h-[40vh] sm:max-h-[300px]">
                {months && months.length > 0 ? (
                  months.map((month: any) => (
                    <SelectItem key={month._id} value={month._id}>
                      {month.month} {month.year}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">No months available</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3 rounded-md text-sm ${
              messageType === 'success' ? 'bg-green-50 text-green-700' :
              messageType === 'error'   ? 'bg-red-50 text-red-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              <div className="flex items-center gap-2">
                {messageType === 'error' && <AlertCircle className="w-4 h-4" />}
                {statusMessage}
              </div>
            </div>
          )}

          {/* Download Button */}
          <Button
            onClick={handleGeneratePDF}
            disabled={loadingData || !selectedMonth}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loadingData ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Generating...</span>
              </div>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>

          <Button onClick={handleClose} variant="outline" className="w-full">
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
