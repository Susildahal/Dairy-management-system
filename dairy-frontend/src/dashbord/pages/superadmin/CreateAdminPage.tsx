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
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation();
  
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
    name: Yup.string().min(2, t('dashboard.superAdmin.validationTooShort')).required(t('dashboard.superAdmin.validationRequired')),
    email: Yup.string().email(t('dashboard.superAdmin.validationInvalidEmail')).required(t('dashboard.superAdmin.validationRequired')),
    phone: Yup.string().min(10, t('dashboard.superAdmin.validationTooShort')).required(t('dashboard.superAdmin.validationRequired')),
    password: isEditMode ? Yup.string().min(6) : Yup.string().min(6).required('Required'),
    role: Yup.string().oneOf(['admin', 'superadmin']).required(t('dashboard.superAdmin.validationRequired')),
    maxUsers: Yup.number().min(1, t('dashboard.superAdmin.validationAtLeastOne')).required(t('dashboard.superAdmin.validationRequired'))
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
        toast.success(t('dashboard.superAdmin.administratorUpdated'));
      } else {
        await dispatch(register(payload)).unwrap();
        toast.success(t('dashboard.superAdmin.administratorCreated'));
      }
      navigate('/superadmin/admins');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">{t('dashboard.superAdmin.loadingData')}</div>;

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
                    {isEditMode ? t('dashboard.superAdmin.modifyAdministrator') : t('dashboard.superAdmin.newAdministratorDetails')}
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
                      <Label>{t('dashboard.superAdmin.fullName')}</Label>
                      <Field as={Input} name="name" placeholder="John Doe" className={errors.name && touched.name ? 'border-red-500' : ''} />
                      <ErrorMessage name="name" component="div" className="text-red-500 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('dashboard.superAdmin.emailAddress')}</Label>
                      <Field as={Input} name="email" type="email" placeholder="admin@dairy.com" />
                      <ErrorMessage name="email" component="div" className="text-red-500 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('header.phone')}</Label>
                      <Field as={Input} name="phone" placeholder="98XXXXXXXX" />
                      <ErrorMessage name="phone" component="div" className="text-red-500 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('dashboard.superAdmin.accessRole')}</Label>
                      <Select value={values.role} onValueChange={(v) => setFieldValue('role', v)}>
                        <SelectTrigger className ='w-full' >
                          <SelectValue placeholder={t('dashboard.superAdmin.selectRole')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">{t('sidebar.admins')}</SelectItem>
                          <SelectItem value="superadmin">{t('dashboard.superAdmin.superAdminRole')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('dashboard.superAdmin.userLimit')}</Label>
                      <Field as={Input} name="maxUsers" type="number" min="1" />
                      <ErrorMessage name="maxUsers" component="div" className="text-red-500 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('auth.password')} {isEditMode && t('dashboard.superAdmin.passwordKeepCurrent')}</Label>
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
                      {isSubmitting ? t('dashboard.superAdmin.processing') : isEditMode ? t('dashboard.superAdmin.updateAdmin') : t('dashboard.superAdmin.createAdmin')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate('/superadmin/admins')}>
                      {t('common.cancel')}
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
