import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import i18n from "@/i18n"
export default function UserHome() {
  const navigate= useNavigate()
  const { t } = useTranslation()
  const hadnlecheck =()=>{
    const flag = localStorage.getItem("flag")
    if(flag==="true"){
      navigate("/admin/dashboard")
    }else{
      navigate("/login")
    } 

  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
    <div className="p-4 flex justify-end gap-2"> 
      <Button variant="outline" onClick={() => i18n.changeLanguage(i18n.language && i18n.language.startsWith('np') ? 'en' : 'np')}>
        {(i18n.language || 'en').slice(0, 2).toUpperCase()}
      </Button>
      <Button className=" bg-green-500 hover:bg-green-600" onClick={hadnlecheck} >{t('home.login')}</Button>
      </div>
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t('home.welcomeTo')} 
              <span className="text-green-600 dark:text-green-400"> {t('home.brand')}</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              {t('home.heroLead')} 
              {t('home.heroSub')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                {t('home.orderNow')}
              </button>
              <button className="px-8 py-3 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold rounded-lg transition-all duration-200">
                {t('home.learnMore')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.whyChoose')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('home.whyDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('home.freshTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('home.freshDescription')}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('home.organicTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('home.organicDescription')}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('home.deliveryTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('home.deliveryDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-green-600 dark:bg-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('home.readyTitle')}
          </h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            {t('home.readySubtitle')}
          </p>
          <button className="px-8 py-3 bg-white text-green-600 font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-200">
            {t('home.startOrder')}
          </button>
        </div>
      </div>
    </div>
  )
}
