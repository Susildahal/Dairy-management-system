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

const AdminManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data: users, loading } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // Fetch all users; we'll filter for admins here
    dispatch(getdata());
  }, [dispatch]);

  const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'superadmin');

  return (
    <div className="space-y-6">
      <AdminHeader 
        title="Admin Management" 
        subtitle="View and manage system administrators" 
        linkname="Create New Admin" 
        linkto="/superadmin/create-admin"
      />
      
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-xl font-bold flex items-center justify-between">
            Administrator Accounts
            <Badge variant="outline" className="ml-2 bg-white">{adminUsers.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Account Role</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead className="text-right pr-6">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">Loading administrators...</TableCell>
                </TableRow>
              ) : adminUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">No administrators found.</TableCell>
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
                      <span className="font-bold text-slate-800">{admin.maxUsers || 0}</span> Users
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => navigate(`/superadmin/admin/${admin._id}/users`)}
                          title="View Managed Users"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          onClick={() => navigate(`/superadmin/edit-admin/${admin._id}`)}
                          title="Edit Admin"
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
