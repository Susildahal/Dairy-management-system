import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../store/store'
import { getdata, deleteuser, updatestatus, clearError  ,updatebothstatus  } from "../../../store/slices/userSlicer"
import { shouldFetchUserData } from '../../../utils/cacheHelper'
import { toast } from "sonner"
import AdminHeader from '@/dashbord/common/AdminHeader'
import Loading from '@/dashbord/ui/Loading'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Trash2, Eye, Edit, AlertTriangle } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTranslation } from 'react-i18next'

const UsersDetails = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data = [], loading, deleteLoading, statusloading, error, lastFetched } = useSelector((state: RootState) => state.user)
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const typedCurrentUser = currentUser as { role?: string; _id?: string } | null;
  
  // Filter users based on role
  // If Admin: only show their own created users (already filtered by backend, but safe to do here too)
  // If SuperAdmin: they probably will use the specialized SuperAdmin routes, 
  // but if they visit this page, they see all users in the state.
  const filteredData = data.filter((u: any) => {
    if (typedCurrentUser?.role === 'admin') {
      // Only show users belonging to this admin
      return u.adminId === typedCurrentUser._id && u.role === 'user';
    }
    return true; // SuperAdmin sees all
  });

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
  }>({ isOpen: false, userId: null, userName: '' });

  useEffect(() => {
    // Fetch user data if it's literally empty and no recent successful fetch was made
    if (shouldFetchUserData(data, lastFetched, loading) && !error) {
      dispatch(getdata());
    }
  }, [dispatch, data, loading, lastFetched, error]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleDeleteUser = (id: string, name: string) => {
    setDeleteDialog({ isOpen: true, userId: id, userName: name });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.userId) return;
    
    try {
      await dispatch(deleteuser(deleteDialog.userId)).unwrap();
      setDeleteDialog({ isOpen: false, userId: null, userName: '' });
    } catch (error) {
      console.error('Error deleting user:', error);
      // Error is already handled by the useEffect above
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false, userId: null, userName: '' });
  };

  const handleStatusUpdate = async (id: string, currentStatus: boolean, userName: string) => {
    try {
      const newStatus = !currentStatus;
      await dispatch(updatestatus({ id, status: newStatus })).unwrap();
      toast.success(t('usersManagement.updatedStatus', { name: userName, status: newStatus ? t('usersManagement.active') : t('usersManagement.inactive') }));
    } catch (error) {
      console.error('Error updating user status:', error);
      // Error is already handled by the useEffect above
    }
  };

   const handleBothUpdate = async (id: string, currentBoth: boolean, userName: string) => {
    try {
      const newBoth = !currentBoth;
      await dispatch(updatebothstatus({ id, both: newBoth })).unwrap();
      toast.success(t('usersManagement.updatedBoth', { name: userName, status: newBoth ? t('usersManagement.active') : t('usersManagement.inactive') }));
    } catch (error) {
      console.error('Error updating user status:', error);
      // Error is already handled by the useEffect above
    }
  };

  if (loading) {
    return <Loading />
  }
  return (
  <div className="space-y-4 w-full   mx-auto ">

      <AdminHeader 
        title={t('usersManagement.title')} 
        subtitle={t('usersManagement.subtitle')} 
        linkname={t('usersManagement.createUser')} 
        linkto="/admin/users/create" 
      />
      
      <div className=" dark:bg-gray-800  dark:border-gray-700">
        <div className="">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('usersManagement.allUsers')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('usersManagement.totalUsers', { count: filteredData.length })}
              </p>
            </div>
          </div>
          
     <div className=" overflow-x-hidden ">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-700">
                  <TableHead className="font-semibold">#</TableHead>
                  <TableHead className="font-semibold">{t('usersManagement.columns.name')}</TableHead>
                  <TableHead className="font-semibold">{t('usersManagement.columns.email')}</TableHead>
                  <TableHead className="font-semibold">{t('usersManagement.columns.phone')}</TableHead>
                  <TableHead className="font-semibold">{t('usersManagement.columns.tagNumber')}</TableHead>
                  <TableHead className="font-semibold">{t('usersManagement.columns.role')}</TableHead>
                  <TableHead className="font-semibold">{t('usersManagement.columns.status')}</TableHead>
                  <TableHead className="font-semibold">{t('usersManagement.columns.both')}</TableHead>
                  <TableHead className="font-semibold text-right">{t('usersManagement.columns.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                          <Eye className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 font-medium">{t('usersManagement.noUsers')}</p>
                          <p className="text-sm text-gray-400">
                            {t('usersManagement.firstUser')}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  (filteredData as any[]).map((user: any, index: number) => (
                    <TableRow key={user._id || index} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="font-medium py-4">{index + 1}</TableCell>
                      <TableCell className="font-medium py-4">{user.name}</TableCell>
                      <TableCell className="py-4">{user.email}</TableCell>
                      <TableCell className="py-4">{user.phone || '-'}</TableCell>
                      <TableCell className="py-4">{user.tagnumber || '-'}</TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant={user.role === 'admin' ? 'default' : 'secondary'}
                          className={user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={!!user.status}
                            onCheckedChange={() => user._id && handleStatusUpdate(user._id, !!user.status, user.name ?? '')}
                            disabled={statusloading}
                            className="data-[state=checked]:bg-green-600"
                          />
                          <Badge 
                            variant={user.status ? 'default' : 'secondary'}
                            className={user.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {user.status ? t('usersManagement.active') : t('usersManagement.inactive')}
                          </Badge>
                        </div>
                      </TableCell>

                       <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={!!user.both}
                            onCheckedChange={() => user._id && handleBothUpdate(user._id, !!user.both, user.name ?? '')}
                            disabled={statusloading}
                            className="data-[state=checked]:bg-green-600"
                          />
                          <Badge 
                            variant={user.both ? 'default' : 'secondary'}
                            className={user.both ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {user.both  ? t('usersManagement.active') : t('usersManagement.inactive')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => user._id && handleDeleteUser(user._id, user.name ?? '')}
                            disabled={deleteLoading}
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                           <Button
                            size="sm"
                            variant="outline"
                            onClick={() => user._id ? navigate(`/admin/users/edit/${user._id}`) : undefined}
                            disabled={deleteLoading}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 h-8 w-8 p-0"
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
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && cancelDelete()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              {t('usersManagement.confirmDeleteTitle')}
            </DialogTitle>
            <DialogDescription className="pt-3">
              {t('usersManagement.confirmDeleteMessage', { name: deleteDialog.userName })}
              <br />
              <span className="text-red-600 font-medium">{t('usersManagement.confirmDeleteWarning')}</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={cancelDelete}
              disabled={deleteLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('usersManagement.deleting')}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('usersManagement.delete')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UsersDetails
