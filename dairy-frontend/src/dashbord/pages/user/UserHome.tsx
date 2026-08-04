import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import i18n from "@/i18n"
import {
  Milk,
  Droplets,
  Users,
  FileText,
  ShieldCheck,
  Globe,
  Building,
  ChevronDown,
  ArrowRight,
} from "lucide-react"

export default function UserHome() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const handleAuthAction = () => {
    const flag = localStorage.getItem("flag")
    if (flag === "true") {
      navigate("/admin/dashboard")
    } else {
      navigate("/login")
    }
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-600 selection:text-white">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
            <div className="bg-emerald-600 p-2 rounded-lg text-white">
              <Milk className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-slate-900">
                Dairy<span className="text-emerald-600">Connect</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Milk & Farm Register</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">
              {t("home.navFeatures")}
            </a>
            <a href="#workflow" className="hover:text-emerald-600 transition-colors">
              {t("home.navWorkflow")}
            </a>
            <a href="#roles" className="hover:text-emerald-600 transition-colors">
              {t("home.navRoles")}
            </a>
            <a href="#faq" className="hover:text-emerald-600 transition-colors">
              {t("home.navFaq")}
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => i18n.changeLanguage(i18n.language && i18n.language.startsWith("np") ? "en" : "np")}
              className="border-slate-300 text-xs font-semibold px-3 h-9 rounded-lg hover:bg-slate-50"
            >
              🌐 {(i18n.language || "en").slice(0, 2).toUpperCase()}
            </Button>
            <Button
              onClick={handleAuthAction}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm px-4 h-9 rounded-lg transition-colors shadow-sm"
            >
              {localStorage.getItem("flag") === "true" ? t("home.dashboard") : t("home.login")}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6">
              {t("home.welcomeTo")}{" "}
              <span className="text-emerald-600">{t("home.brand")}</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">
              {t("home.heroLead")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center">
              <Button
                onClick={handleAuthAction}
                size="lg"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 px-7 rounded-lg shadow-sm transition-colors"
              >
                <span>{t("home.getStarted")}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <a href="#workflow" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-slate-300 text-slate-700 font-semibold h-11 px-6 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {t("home.exploreFeatures")}
                </Button>
              </a>
            </div>
          </div>

          {/* Feature Highlight Banner */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                {
                  icon: <Droplets className="w-5 h-5" />,
                  color: "emerald",
                  label: "Smart Collection",
                  desc: "Morning & Evening shifts tracked in real-time",
                },
                {
                  icon: <Users className="w-5 h-5" />,
                  color: "sky",
                  label: "Farmer Registry",
                  desc: "Manage all farmers with unique tag IDs",
                },
                {
                  icon: <FileText className="w-5 h-5" />,
                  color: "violet",
                  label: "Auto Billing",
                  desc: "FAT/SNF based payments calculated instantly",
                },
                {
                  icon: <ShieldCheck className="w-5 h-5" />,
                  color: "amber",
                  label: "Secure & Reliable",
                  desc: "Role-based access for Admin, Supervisor & Farmers",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    animationDelay: `${i * 100}ms`,
                    animationFillMode: "both",
                  }}
                  className={`
                    group relative flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-white
                    border border-slate-200 shadow-sm overflow-hidden
                    transition-all duration-300 ease-out
                    hover:-translate-y-1 hover:shadow-lg
                    ${item.color === "emerald"
                      ? "hover:border-emerald-300"
                      : item.color === "sky"
                        ? "hover:border-sky-300"
                        : item.color === "violet"
                          ? "hover:border-violet-300"
                          : "hover:border-amber-300"
                    }
                  `}
                >
                  {/* Glow effect on hover */}
                  <div
                    className={`
                      absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                      ${item.color === "emerald"
                        ? "bg-gradient-to-br from-emerald-50/60 to-transparent"
                        : item.color === "sky"
                          ? "bg-gradient-to-br from-sky-50/60 to-transparent"
                          : item.color === "violet"
                            ? "bg-gradient-to-br from-violet-50/60 to-transparent"
                            : "bg-gradient-to-br from-amber-50/60 to-transparent"
                      }
                    `}
                  />

                  {/* Icon */}
                  <div
                    className={`
                      w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                      ${item.color === "emerald"
                        ? "bg-emerald-100 text-emerald-600"
                        : item.color === "sky"
                          ? "bg-sky-100 text-sky-600"
                          : item.color === "violet"
                            ? "bg-violet-100 text-violet-600"
                            : "bg-amber-100 text-amber-600"
                      }
                    `}
                  >
                    {item.icon}
                  </div>

                  {/* Text */}
                  <div className="relative">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 mb-1 leading-snug">
                      {item.label}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  {/* Bottom accent line */}
                  <div
                    className={`
                      absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100
                      transition-transform duration-300 origin-left
                      ${item.color === "emerald"
                        ? "bg-emerald-400"
                        : item.color === "sky"
                          ? "bg-sky-400"
                          : item.color === "violet"
                            ? "bg-violet-400"
                            : "bg-amber-400"
                      }
                    `}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid Section */}
      <section id="features" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
              {t("home.featuresTitle")}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              {t("home.featuresSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {t("home.featCollectionTitle")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t("home.featCollectionDesc")}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {t("home.featFarmerTitle")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t("home.featFarmerDesc")}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {t("home.featBillingTitle")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t("home.featBillingDesc")}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {t("home.featMultiRoleTitle")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t("home.featMultiRoleDesc")}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {t("home.featBilingualTitle")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t("home.featBilingualDesc")}
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {t("home.featSecurityTitle")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t("home.featSecurityDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="workflow" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
              {t("home.workflowTitle")}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              {t("home.workflowSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">{t("home.step1Title")}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t("home.step1Desc")}</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">{t("home.step2Title")}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t("home.step2Desc")}</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">{t("home.step3Title")}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t("home.step3Desc")}</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                4
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">{t("home.step4Title")}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t("home.step4Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholders / Roles Section */}
      <section id="roles" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
              {t("home.rolesTitle")}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              {t("home.rolesSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-2">{t("home.roleAdminTitle")}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t("home.roleAdminDesc")}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-2">{t("home.roleSuperTitle")}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t("home.roleSuperDesc")}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-2">{t("home.roleFarmerTitle")}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t("home.roleFarmerDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Benefits Bar */}
      <section className="py-12 bg-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold mb-1">{t("home.metricLiters")}</div>
              <div className="text-xs text-emerald-100">{t("home.metricsTitle")}</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold mb-1">{t("home.metricFarmers")}</div>
              <div className="text-xs text-emerald-100">Saved Record Time</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold mb-1">{t("home.metricAccuracy")}</div>
              <div className="text-xs text-emerald-100">Zero Calculation Errors</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold mb-1">{t("home.metricPaperless")}</div>
              <div className="text-xs text-emerald-100">Paperless Operation</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
              {t("home.faqTitle")}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              {t("home.faqSubtitle")}
            </p>
          </div>

          <div className="space-y-3">
            {[
              { q: t("home.faq1Q"), a: t("home.faq1A") },
              { q: t("home.faq2Q"), a: t("home.faq2A") },
              { q: t("home.faq3Q"), a: t("home.faq3A") },
              { q: t("home.faq4Q"), a: t("home.faq4A") },
            ].map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 text-left font-semibold text-sm text-slate-900 flex justify-between items-center gap-4 hover:bg-slate-100 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${openFaq === index ? "rotate-180 text-emerald-600" : ""
                      }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 border-t border-slate-200/60 pt-3 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-14 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t("home.ctaTitle")}</h2>
          <p className="text-slate-300 text-xs sm:text-sm mb-6 max-w-lg mx-auto">{t("home.ctaSubtitle")}</p>
          <Button
            onClick={handleAuthAction}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 px-7 rounded-lg transition-colors shadow-sm"
          >
            {t("home.ctaButton")}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded text-white">
              <Milk className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">DairyConnect</span>
            <span className="text-slate-500 ml-2">© {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-white transition-colors">
              {t("home.navFeatures")}
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              {t("home.navWorkflow")}
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              {t("home.navFaq")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
