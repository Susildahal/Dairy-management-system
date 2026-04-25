import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { getUsers } from '../../../store/slices/userSlicer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useParams } from 'react-router-dom';

const ViewAdminUsers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { adminId } = useParams<{ adminId: string }>();
  // Correctly access state based on userSlicer: { data: [], loading: false, ... }
  const { data: users, loading } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // We use the specialized getUsers thunk which accepts a filter object
    // The backend now filters strictly by adminId if provided
    dispatch(getUsers({ adminId, role: 'user' }));
  }, [dispatch, adminId]);

  return (
    <div className="space-y-6">
      
      <Card>
        <CardHeader>
          <CardTitle>Users Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Tag Number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-muted-foreground">Fetching users...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users && users.length > 0 ? (
                users.map(user => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium text-slate-700">{user.name}</TableCell>
                    <TableCell className="text-slate-600 font-mono text-xs">{user.email}</TableCell>
                    <TableCell className="text-slate-600 font-medium">{user.phone}</TableCell>
                    <TableCell className="text-slate-600 font-bold">{user.tagnumber}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-slate-400">
                    No users found for this administrator.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewAdminUsers;
