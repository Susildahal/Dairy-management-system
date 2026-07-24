import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { getdata } from '@/store/slices/userSlicer'
import { getAllMilk } from '@/store/slices/milkSlicer'
import { getActiveMonth, getAllMonths } from '@/store/slices/monthslicer'
import { getsettingdata } from '@/store/slices/sitesettingSlicer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Milk, DollarSign, TrendingUp, Calendar, Settings, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdminPDFModal } from './components/AdminPDFModal'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const [currentTime, setCurrentTime] = useState(new Date())

  const { data: users, loading: usersLoading } = useSelector((state: RootState) => state.user)
  const { adminTotals, loading: milkLoading } = useSelector((state: RootState) => state.milk)
  const { activeMonth } = useSelector((state: RootState) => state.months)
  const { months } = useSelector((state: RootState) => state.months)
  const { data: siteSettings } = useSelector((state: RootState) => state.siteSettings)
  const [showPDFModal, setShowPDFModal] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    dispatch(getdata())
    dispatch(getAllMilk({}))
    dispatch(getActiveMonth())
    dispatch(getAllMonths())
    dispatch(getsettingdata())

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [dispatch])

  // Calculate statistics
  const activeUsers = users.filter(user => user.status && user.role !== 'admin').length
  const totalUsers = users.filter(user => user.role !== 'admin').length
  const adminCount = users.filter(user => user.role === 'admin').length

  const currentMonthTotal = adminTotals.length > 0 ? adminTotals[0] : null
  const totalMilk = currentMonthTotal?.totalMilk || 0
  const totalRevenue = currentMonthTotal?.totalMoney || 0

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(i18n.language && i18n.language.startsWith('np') ? 'ne-NP' : 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(i18n.language && i18n.language.startsWith('np') ? 'ne-NP' : 'en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {t('dashboard.admin.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {t('dashboard.admin.welcome')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatTime(currentTime)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(currentTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Active Month Banner */}
        {activeMonth && (
          <Card className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 border-none ">
            <CardContent className="py-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8" />
                  <div>
                    <p className="text-sm opacity-90">{t('dashboard.admin.activeMonth')}</p>
                    <p className="text-2xl font-bold">
                      {activeMonth.month} {activeMonth.year}
                    </p>
                  </div>
                </div>
                <Badge className="bg-white text-blue-600 hover:bg-white">Active</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Users Card */}
          <Card className=" duration-300 border-t-4 border-t-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('dashboard.admin.totalUsers')}
              </CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {usersLoading ? '...' : totalUsers}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activeUsers} {t('dashboard.admin.usersActive')} • {totalUsers - activeUsers} {t('dashboard.admin.usersInactive')}
              </p>
              <Link to="/admin/users" className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-2 inline-block">
                {t('dashboard.admin.viewAllUsers')}
              </Link>
            </CardContent>
          </Card>

          {/* Total Milk Card */}
          <Card className=" duration-300 border-t-4 border-t-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('dashboard.admin.totalMilkThisMonth')}
              </CardTitle>
              <Milk className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {milkLoading ? '...' : totalMilk.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('dashboard.admin.litersCollected')}
              </p>
              <Link to="/admin/milk-management" className="text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 mt-2 inline-block">
                {t('dashboard.admin.viewMilkRecords')}
              </Link>
            </CardContent>
          </Card>

          {/* Total Revenue Card */}
          <Card className="  duration-300 border-t-4 border-t-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('dashboard.admin.totalRevenue')}
              </CardTitle>
              <DollarSign className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                ₹{milkLoading ? '...' : totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('dashboard.admin.currentMonthEarnings')}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">
                  {activeMonth ? `${activeMonth.month}` : t('dashboard.admin.noActiveMonth')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Admin Count Card */}
          <Card className=" duration-300 border-t-4 border-t-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('dashboard.admin.administrators')}
              </CardTitle>
              <Settings className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {usersLoading ? '...' : adminCount}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('dashboard.admin.systemAdministrators')}
              </p>
              <Link to="/admin/settings" className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 mt-2 inline-block">
                {t('dashboard.admin.manageSettings')}
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & System Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions Card */}
          <Card className="">
            <CardHeader>
              <CardTitle className="text-xl">{t('dashboard.admin.quickActionsTitle')}</CardTitle>
              <CardDescription>{t('dashboard.admin.quickActionsSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link 
                to="/admin/add-milk" 
                className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Milk className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{t('dashboard.admin.addMilkEntry')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.admin.recordMilkCollection')}</p>
                  </div>
                </div>
                <span className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              <Link 
                to="/admin/create-user" 
                className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{t('dashboard.admin.createNewUser')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.admin.addUserToSystem')}</p>
                  </div>
                </div>
                <span className="text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              <Link 
                to="/admin/month-management" 
                className="flex items-center justify-between p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{t('dashboard.admin.manageMonths')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.admin.createAndActivateMonths')}</p>
                  </div>
                </div>
                <span className="text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              <button
                onClick={() => setShowPDFModal(true)}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">{t('dashboard.admin.generatePdfReport')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.admin.downloadMonthlyMilkReports')}</p>
                  </div>
                </div>
                <span className="text-orange-600 dark:text-orange-400 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </CardContent>
          </Card>

          {/* System Information Card */}
          <Card className="">
            <CardHeader>
              <CardTitle className="text-xl">{t('dashboard.admin.systemInformation')}</CardTitle>
              <CardDescription>{t('dashboard.admin.currentSystemConfiguration')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {siteSettings ? (
                <>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.admin.farmName')}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{siteSettings.name || t('common.notSet')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.admin.contactEmail')}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{siteSettings.email || t('common.notSet')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.admin.contactPhone')}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{siteSettings.phone || t('common.notSet')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.admin.userRate')}</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{siteSettings.rate_of_user || '0'}</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.admin.adminRate')}</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">₹{siteSettings.rate_of_admin || '0'}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('dashboard.admin.notConfigured')}</p>
                  <Link to="/admin/settings" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 mt-2 inline-block">
                    {t('dashboard.admin.configureNow')}
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <Card className="mt-6 ">
          <CardHeader>
            <CardTitle className="text-xl">{t('dashboard.admin.recentActivity')}</CardTitle>
            <CardDescription>{t('dashboard.admin.latestUpdatesAndStatistics')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('dashboard.admin.activeUsers')}</p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{activeUsers}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t('dashboard.admin.currentlyCollectingMilk')}</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('dashboard.admin.avgMilkPerUser')}</p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {activeUsers > 0 ? (totalMilk / activeUsers).toFixed(1) : '0'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t('dashboard.admin.litersPerUser')}</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('dashboard.admin.systemStatus')}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{t('dashboard.admin.online')}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t('dashboard.admin.allSystemsOperational')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin PDF Modal */}
      <AdminPDFModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        months={months || []}
      />
    </div>
  )
}
