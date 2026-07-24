import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminHeader from '../../common/AdminHeader';
import { useTranslation } from 'react-i18next';

const SuperAdminDashboard = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      {/* <AdminHeader 
        title="SuperAdmin Dashboard" 
        subtitle="System overview and global control" 
        linkname="Manage Admins" 
        linkto="/superadmin/admins"
      /> */}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2  border-t-4 border-t-indigo-600">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800">{t('dashboard.superAdmin.welcome')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 leading-relaxed">
              {t('dashboard.superAdmin.description')}
            </p>
            <div className="flex gap-4 pt-4">
              <div className="bg-indigo-50 p-4 rounded-xl flex-1 border border-indigo-100">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">{t('dashboard.superAdmin.totalCapacity')}</p>
                <p className="text-2xl font-black text-indigo-900 leading-none">{t('dashboard.superAdmin.global')}</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl flex-1 border border-emerald-100">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">{t('dashboard.superAdmin.systemStatus')}</p>
                <p className="text-2xl font-black text-emerald-900 leading-none">{t('dashboard.superAdmin.active')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-slate-200 bg-slate-50/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold">{t('dashboard.superAdmin.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
             <button className="w-full py-3 px-4 bg-white border border-slate-200 rounded-lg text-left text-sm font-medium hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-between group">
               {t('dashboard.superAdmin.createNewAdmin')}
                <span className="text-slate-300 group-hover:text-indigo-400">→</span>
             </button>
             <button className="w-full py-3 px-4 bg-white border border-slate-200 rounded-lg text-left text-sm font-medium hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-between group">
               {t('dashboard.superAdmin.globalSettings')}
                <span className="text-slate-300 group-hover:text-indigo-400">→</span>
             </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
