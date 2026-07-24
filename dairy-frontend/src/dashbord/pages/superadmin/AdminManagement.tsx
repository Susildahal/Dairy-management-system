import React, { useEffect } from 'react';
import AdminHeader from '../../common/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { getdata } from '../../../store/slices/userSlicer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data: users, loading } = useSelector((state: RootState) => state.user);
  const { t } = useTranslation();

  useEffect(() => {
    // Fetch all users; we'll filter for admins here
    dispatch(getdata());
  }, [dispatch]);

  const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'superadmin');

  return (
    <div className="space-y-6">
      <AdminHeader 
        title={t('dashboard.superAdmin.adminManagement')} 
        subtitle={t('dashboard.superAdmin.viewAndManage')} 
        linkname={t('dashboard.superAdmin.createNewAdmin')} 
        linkto="/superadmin/create-admin"
      />
      
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-xl font-bold flex items-center justify-between">
            {t('dashboard.superAdmin.administrators')}
            <Badge variant="outline" className="ml-2 bg-white">{adminUsers.length} {t('dashboard.superAdmin.usersCount')}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>{t('dashboard.superAdmin.fullName')}</TableHead>
                <TableHead>{t('dashboard.superAdmin.emailAddress')}</TableHead>
                <TableHead>{t('dashboard.superAdmin.accountRole')}</TableHead>
                <TableHead>{t('dashboard.superAdmin.capacity')}</TableHead>
                <TableHead className="text-right pr-6">{t('dashboard.superAdmin.manage')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">{t('dashboard.superAdmin.loadingAdmins')}</TableCell>
                </TableRow>
              ) : adminUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">{t('dashboard.superAdmin.noAdministrators')}</TableCell>
                </TableRow>
              ) : (
                adminUsers.map((admin, idx) => (
                  <TableRow key={admin._id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-medium text-slate-400">{idx + 1}</TableCell>
                    <TableCell className="font-semibold text-slate-700">{admin.name}</TableCell>
                    <TableCell className="text-slate-500 font-mono text-xs">{admin.email}</TableCell>
                    <TableCell>
                      <Badge className={admin.role === 'superadmin' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-blue-100 text-blue-700 border-blue-200'}>
                        {admin.role.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <span className="font-bold text-slate-800">{admin.maxUsers || 0}</span> {t('dashboard.superAdmin.usersCount')}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => navigate(`/superadmin/admin/${admin._id}/users`)}
                          title={t('dashboard.superAdmin.viewManagedUsers')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          onClick={() => navigate(`/superadmin/edit-admin/${admin._id}`)}
                          title={t('dashboard.superAdmin.editAdmin')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManagement;
