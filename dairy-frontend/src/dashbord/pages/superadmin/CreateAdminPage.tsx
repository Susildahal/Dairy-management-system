import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ShieldCheck, Eye, EyeOff, Save, UserPlus } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../store/store'
import { register, getbyid, updateUser, clearError } from "../../../store/slices/userSlicer"
import { toast } from "sonner"
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik'
import * as Yup from 'yup'

// Types
interface AdminFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  status: boolean;
  role: string;
  maxUsers: number;
}

const CreateAdminPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { createLoading, updateLoading, data, error } = useSelector((state: RootState) => state.user);
  
  const isEditMode = Boolean(id);
  const [showPassword, setShowPassword] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<AdminFormValues>({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: true,
    role: 'admin',
    maxUsers: 10
  });

  const validationSchema = Yup.object({
    name: Yup.string().min(2, 'Too short').required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    phone: Yup.string().min(10, 'Too short').required('Required'),
    password: isEditMode ? Yup.string().min(6) : Yup.string().min(6).required('Required'),
    role: Yup.string().oneOf(['admin', 'superadmin']).required('Required'),
    maxUsers: Yup.number().min(1, 'At least 1').required('Required')
  });

  useEffect(() => {
    if (isEditMode && id) {
      setInitialLoading(true);
      dispatch(getbyid(id))
        .unwrap()
        .then((userData) => {
          setInitialValues({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            password: '',
            status: userData.status ?? true,
            role: userData.role || 'admin',
            maxUsers: userData.maxUsers || 10
          });
        })
        .finally(() => setInitialLoading(false));
    }
  }, [id, isEditMode, dispatch]);

  const handleSubmit = async (values: AdminFormValues, { setSubmitting }: FormikHelpers<AdminFormValues>) => {
    try {
      const payload = { ...values };
      if (isEditMode) {
        if (!payload.password) delete (payload as any).password;
        await dispatch(updateUser({ id: id!, userData: payload })).unwrap();
        toast.success('Administrator updated successfully');
      } else {
        await dispatch(register(payload)).unwrap();
        toast.success('Administrator created successfully');
      }
      navigate('/superadmin/admins');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading administrator data...</div>;

  return (
    <div className="space-y-6">
      
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg border-t-4 border-t-blue-600">
          <CardHeader className="pb-0 pt-6 px-8">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800">
                    {isEditMode ? 'Modify Administrator' : 'New Administrator Details'}
                </h3>
             </div>
          </CardHeader>
          <CardContent className="p-8">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting, errors, touched, setFieldValue, values }) => (
                <Form className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Field as={Input} name="name" placeholder="John Doe" className={errors.name && touched.name ? 'border-red-500' : ''} />
                      <ErrorMessage name="name" component="div" className="text-red-500 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Field as={Input} name="email" type="email" placeholder="admin@dairy.com" />
                      <ErrorMessage name="email" component="div" className="text-red-500 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Field as={Input} name="phone" placeholder="98XXXXXXXX" />
                      <ErrorMessage name="phone" component="div" className="text-red-500 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <Label>Access Role</Label>
                      <Select value={values.role} onValueChange={(v) => setFieldValue('role', v)}>
                        <SelectTrigger className ='w-full' >
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin"> Admin</SelectItem>
                          <SelectItem value="superadmin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>User Limit (Max Users)</Label>
                      <Field as={Input} name="maxUsers" type="number" min="1" />
                      <ErrorMessage name="maxUsers" component="div" className="text-red-500 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <Label>Password {isEditMode && '(Leave blank to keep current)'}</Label>
                      <div className="relative">
                        <Field
                          as={Input}
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-2.5 text-slate-400"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <ErrorMessage name="password" component="div" className="text-red-500 text-xs" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 border-t">
                    <Button type="submit" disabled={isSubmitting || createLoading || updateLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                      {isSubmitting ? 'Processing...' : isEditMode ? 'Update Admin' : 'Create Admin'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate('/superadmin/admins')}>
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateAdminPage;
