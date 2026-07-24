import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Milk, Search } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
            <Milk className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* 404 Number */}
        <div className="mb-6">
          <h1 className="text-8xl md:text-9xl font-bold text-green-600 dark:text-green-400 tracking-tight">
            404
          </h1>
        </div>

        {/* Main Message */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('notFound.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            {t('notFound.lead')}
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            {t('notFound.subtitle')}
          </p>
        </div>

        {/* Search Suggestion */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-gray-400 mr-2" />
            <span className="text-gray-600 dark:text-gray-400">
              {t('notFound.hint')}
            </span>
          </div>
          
          
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Link to="/dashboard">
              <Home className="w-5 h-5 mr-2" />
              {t('notFound.backToDashboard')}
            </Link>
          </Button>
          <Link to="/login">
          <Button
            variant="outline"
            size="lg"
        
            className="border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('notFound.goBack')}
          </Button>
            </Link>
        </div>
    

        {/* Footer Message */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('notFound.needHelp')}{" "}
            <Link 
              to="/help" 
              className="text-green-600 dark:text-green-400 hover:underline font-medium"
            >
              {t('notFound.helpCenter')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
