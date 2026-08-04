import { useState, useEffect } from "react"
import { Settings, User, Menu, Home, Users, BarChart3, FileText, Mail, Calendar, LogOut, Landmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useSelector, useDispatch } from "react-redux"
import { getmee } from "../../store/slices/meeSlicer"
import { RootState, AppDispatch } from "../../store/store"
import { useAuth } from "@/hooks/useAuth"
import axiosInstance from "@/utils/axiosInstance"
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'

const sidebarItems = [
  {
    titleKey: "sidebar.dashboard",
    icon: Home,
    href: "/admin/dashboard",
  },
  {
    titleKey: "sidebar.usersDetails",
    icon: Users,
    href: "/admin/users",
  },
  {
    titleKey: "sidebar.createUser",
    icon: Users,
    href: "/admin/users/create",
  },
  {
    titleKey: "sidebar.manageDailyMilk",
    icon: FileText,
    href: "/admin/milk",
  },
  {
    titleKey: "sidebar.addMonth",
    icon: BarChart3,
    href: "/admin/add-month",
  },
  {
    titleKey: "sidebar.settings",
    icon: Settings,
    href: "/admin/settings",
  },
  {
    titleKey: "sidebar.userMonthlyReports",
    icon: Mail,
    href: "/admin/user-reports",
  },
  {
    titleKey: "sidebar.adminMonthlyReports",
    icon: Calendar,
    href: "/admin/admin-reports",
  },
]

interface HeaderProps {
  email: string;
  phone: string;
}

export function Header({ email, phone }: HeaderProps) {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { data, loading, error } = useSelector((state: RootState) => state.mee)
  const { logout } = useAuth()
  const { t } = useTranslation()

  // state.mee.data may be an untyped object; cast to any for safe property access
  const user = data as any

  useEffect(() => {
    const shouldFetch = !data && !loading && !error
    if (shouldFetch) dispatch(getmee())
  }, [dispatch, data, loading, error])

  const handleLogout = () => {
    axiosInstance.post('users/user/logout')
      .then(() => {
        logout()
        navigate('/login')
        localStorage.removeItem('flag')
      })
      .catch((err) => {
        console.error('Logout failed:', err)
        logout()
      })
  }

  const location = useLocation()
  const pathname = location.pathname

  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-800/60">
      <div className="flex h-12 sm:h-14 md:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 sm:h-9 sm:w-9">
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-white dark:bg-gray-800">
              <div className="flex flex-col h-full">
                <div className="flex items-center p-4 h-14 sm:h-16 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('app.dairyFarm')}</h2>
                </div>

                <ScrollArea className="flex-1 px-3 py-4">
                  <nav className="space-y-2">
                    {sidebarItems.map((item) => (
                      <Link key={item.href} to={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3",
                            pathname === item.href && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                          )}
                        >
                          <item.icon className="h-4 w-4 mr-3" />
                          <span>{t(item.titleKey as string)}</span>
                        </Button>
                      </Link>
                    ))}
                  </nav>
                </ScrollArea>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user?.name || "Admin User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email || "admin@dairy.com"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden sm:block">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white truncate">
              {t('app.dashboard')}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => i18n.changeLanguage(i18n.language && i18n.language.startsWith('np') ? 'en' : 'np')}>
            {(i18n.language || 'en').slice(0, 2).toUpperCase()}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full p-0">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 md:h-6 md:w-6">
                  <AvatarImage src={user?.avatar || "/diverse-user-avatars.png"} alt="User" />
                  <AvatarFallback className="text-xs sm:text-sm bg-green-500 text-white">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 sm:w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none truncate">{t('header.name')}: {user?.name || t('header.adminUser')}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{t('header.email')}: {user?.email || t('header.adminEmail')}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{t('header.role')}: {user?.role || t('header.adminRole')}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{t('header.phone')}: {user?.phone || t('header.adminPhone')}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4 text-red-600" />
                <span>{t('menu.logout')}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="font-normal">{t('menu.language')}</DropdownMenuLabel>
              <DropdownMenuItem className="cursor-pointer" onClick={() => i18n.changeLanguage('en')}>
                <span>{t('menu.english')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => i18n.changeLanguage('np')}>
                <span>{t('menu.nepali')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
