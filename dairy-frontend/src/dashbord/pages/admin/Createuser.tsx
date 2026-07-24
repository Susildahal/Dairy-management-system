import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, UserPlus, Eye, EyeOff, Save, ShieldCheck } from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../store/store'
import { register, getbyid, updateUser, clearError } from "../../../store/slices/userSlicer"
import { toast } from "sonner"
import AdminHeader from '@/dashbord/common/AdminHeader'
import { useParams } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'

// Types
interface UserFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  status: boolean;
  tagnumber: string;
  both: string;
  role: string;
  maxUsers?: number;
}

interface UserEntity {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: boolean;
  tagnumber?: string;
  both?: boolean;
  maxUsers?: number;
}

const Createuser = ({ isedit = false }: { isedit?: boolean }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { createLoading, updateLoading, data, error } = useSelector((state: RootState) => state.user);
  const { id } = useParams<{ id?: string }>();
  
  // Detect if we are in SuperAdmin context
  const isSuperAdminPath = location.pathname.startsWith('/superadmin');
  
  // Determine if we're editing or creating
  const isEditMode = isedit || Boolean(id);
  const isLoading = createLoading || updateLoading;

  const [showPassword, setShowPassword] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<UserFormValues>({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: true,
    tagnumber: '',
    both: 'true',
    role: isSuperAdminPath ? 'admin' : 'user',
    maxUsers: 10
  });

  // Validation Schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, t('createUser.validation.nameMin'))
      .max(50, t('createUser.validation.nameMax'))
      .required(t('createUser.validation.nameRequired')),
    
    email: Yup.string()
      .email(t('createUser.validation.emailInvalid'))
      .required(t('createUser.validation.emailRequired')),
    
    phone: Yup.string()
      .matches(/^[0-9+\-\s()]+$/, t('createUser.validation.phoneInvalid'))
      .min(10, t('createUser.validation.phoneMin'))
      .required(t('createUser.validation.phoneRequired')),
    
    password: isEditMode 
      ? Yup.string()
          .min(6, t('createUser.validation.passwordMin'))
          .optional()
      : Yup.string()
          .min(6, t('createUser.validation.passwordMin'))
          .required(t('createUser.validation.passwordRequired')),
    
    tagnumber: Yup.string()
      .required(t('createUser.validation.tagRequired')),
    
    both: Yup.string()
      .oneOf(['true', 'false'], t('createUser.validation.typeRequired'))
      .required(t('createUser.validation.typeRequired')),
    
    role: Yup.string().required(t('createUser.validation.roleRequired')),
    maxUsers: Yup.number().when('role', {
      is: 'admin',
      then: (schema) => schema.min(1, t('createUser.validation.maxUsersMin')).required(t('createUser.validation.maxUsersRequired')),
      otherwise: (schema) => schema.optional()
    })
  });

  // Load user data if editing
  useEffect(() => {
    if (isEditMode && id) {
      setInitialLoading(true);
      
      // Safely get users array from state
      const users = Array.isArray(data) ? data : [];
      // First check if user exists in current state
      const existingUser = users.find((user: UserEntity) => user._id === id);
      
      if (existingUser) {
        // User found in state, populate form
        const userValues: UserFormValues = {
          name: existingUser.name || '',
          email: existingUser.email || '',
          phone: existingUser.phone || '',
          password: '', // Don't populate password for security
          status: existingUser.status !== undefined ? existingUser.status : true,
          tagnumber: existingUser.tagnumber || '',
          both: existingUser.both !== undefined ? String(existingUser.both) : 'true',
          role: existingUser.role || 'user',
          maxUsers: existingUser.maxUsers || 10
        };
        setInitialValues(userValues);
        setInitialLoading(false);
      } else {
        // User not in state, fetch from API
        dispatch(getbyid(id!))
          .unwrap()
          .then((userData: UserEntity) => {
            const userValues: UserFormValues = {
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',
              password: '', // Don't populate password for security
              status: userData.status !== undefined ? userData.status : true,
              tagnumber: userData.tagnumber || '',
              both: userData.both !== undefined ? String(userData.both) : 'true',
              role: userData.role || 'user',
              maxUsers: userData.maxUsers || 10
            };
            setInitialValues(userValues);
          })
          .catch((error: any) => {
            toast.error(t('createUser.failedLoad'));
            navigate(isSuperAdminPath ? '/superadmin/admins' : '/admin/users');
          })
          .finally(() => {
            setInitialLoading(false);
          });
      }
    }
  }, [id, isEditMode, dispatch, data, navigate, isSuperAdminPath]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());   
    }
  }, [error, dispatch]);

  const handleSubmit = async (
    values: UserFormValues, 
    { setSubmitting, resetForm }: FormikHelpers<UserFormValues>
  ) => {
    try {
      if (isEditMode && id) {
        // Update existing user
        const updateData: any = { ...values };
        
        // Convert 'both' string to boolean for API
        updateData.both = updateData.both === 'true';
        
        // If password is empty string, don't include it in update
        if (!updateData.password?.trim()) {
          delete updateData.password;
        }
        
        // Prepare payload: { id, userData } to match the thunk signature
        const payload = { id: id!, userData: updateData };

        await dispatch(updateUser(payload)).unwrap();
        toast.success(isSuperAdminPath ? t('createUser.successUpdateAdmin') : t('createUser.successUpdateUser'));
      } else {
        // Create new user/admin
        const createPayload = { 
          ...values, 
          both: values.both === 'true' 
        };
        await dispatch(register(createPayload)).unwrap();
        toast.success(isSuperAdminPath ? t('createUser.successCreateAdmin') : t('createUser.successCreateUser'));
        
        // Reset form after successful creation
        resetForm();
      }

      // Navigate back
      setTimeout(() => {
        navigate(isSuperAdminPath ? '/superadmin/admins' : '/admin/users');
      }, 1000);

    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'}:`, error);
      const message = typeof error === 'string' ? error : (error as any)?.message
      toast.error(message || t('createUser.failedLoad'))
    } finally {
      setSubmitting(false);
    }
  }

  // UI labels based on role/path
  const pageTitle = isSuperAdminPath ? t('dashboard.superAdmin.adminManagement') : t('usersManagement.title');
  const pageSubtitle = isEditMode 
    ? t('createUser.subtitleEdit', { entity: isSuperAdminPath ? t('dashboard.superAdmin.superAdminRole') : t('createUser.user') }) 
    : t('createUser.subtitleCreate', { entity: isSuperAdminPath ? t('dashboard.superAdmin.superAdminRole') : t('createUser.user') });
  const backToPath = isSuperAdminPath ? "/superadmin/admins" : "/admin/users";
  const backToLabel = isSuperAdminPath ? t('usersManagement.viewAdmins') : t('usersManagement.viewUsers');

  // Show loading screen while fetching user data for edit
  if (isEditMode && initialLoading) {
    return (
      <div className="space-y-6">
        <AdminHeader 
          title={pageTitle} 
          subtitle={t('createUser.loading')} 
          linkname={backToLabel} 
          linkto={backToPath}
        />
        <Card className="border-gray-200">
          <CardContent className="p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">{t('createUser.loading')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader 
        title={pageTitle} 
        subtitle={pageSubtitle} 
        linkname={backToLabel} 
        linkto={backToPath}
      />
      
      <div className="max-w-4xl mx-auto">
        <Card className="">
          <CardHeader className="pb-0 pt-6 px-8">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {isSuperAdminPath ? <ShieldCheck className="w-5 h-5 text-primary" /> : <UserPlus className="w-5 h-5 text-primary" />}
                </div>
                <h3 className="text-xl font-semibold">{isEditMode ? t('createUser.editProfile') : t('createUser.basicInformation')}</h3>
             </div>
          </CardHeader>
          <CardContent className="p-8">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize={true}
            >
              {({ values, setFieldValue, isSubmitting, errors, touched }) => (
                <Form className="space-y-6">
                  {/* ... rest of the form ... */}
                  {/* First Row - Name and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        {t('createUser.fullName')} <span className="text-red-500">*</span>
                      </Label>
                      <Field
                        as={Input}
                        id="name"
                        name="name"
                        type="text"
                        placeholder={t('createUser.enterFullName')}
                        className={`bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                          errors.name && touched.name ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />
                      <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        {t('createUser.emailAddress')} <span className="text-red-500">*</span>
                      </Label>
                      <Field
                        as={Input}
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t('createUser.enterEmail')}
                        className={`bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                          errors.email && touched.email ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />
                      <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                  
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
                    {/* Phone Field */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        {t('createUser.phoneNumber')} <span className="text-red-500">*</span>
                      </Label>
                      <Field
                        as={Input}
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder={t('createUser.enterPhone')}
                        className={`bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                          errors.phone && touched.phone ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />
                      <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Role Field */}
                    <div className="space-y-2 w-full">
                      <Label htmlFor="role" className="text-sm font-medium">
                        {t('createUser.role')} <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={values.role} 
                        onValueChange={(value) => setFieldValue('role', value)}
                      >
                        <SelectTrigger className={`bg-gray-50 dark:bg-gray-800 w-full border-gray-200 dark:border-gray-700 ${
                          errors.role && touched.role ? 'border-red-500 focus:border-red-500' : ''
                        }`}>
                          <SelectValue placeholder={t('createUser.selectRole')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">{t('createUser.admin')}</SelectItem>
                          <SelectItem value="user">{t('createUser.user')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <ErrorMessage name="role" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Max Users (Conditional) */}
                    {values.role === 'admin' && (
                      <div className="space-y-2">
                        <Label htmlFor="maxUsers">{t('createUser.maxUsers')}</Label>
                        <Field
                          as={Input}
                          id="maxUsers"
                          name="maxUsers"
                          type="number"
                          placeholder={t('createUser.enterMaxUsers')}
                        />
                        <ErrorMessage name="maxUsers" component="div" className="text-red-500 text-sm" />
                      </div>
                    )}

                    {/* Tag Number Field */}
                    <div className="space-y-2">
                      <Label htmlFor="tagnumber" className="text-sm font-medium">
                        {t('createUser.tagNumber')} <span className="text-red-500">*</span>
                      </Label>
                      <Field
                        as={Input}
                        id="tagnumber"
                        name="tagnumber"
                        type="text"
                        placeholder={t('createUser.enterTagNumber')}
                        className={`bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                          errors.tagnumber && touched.tagnumber ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />
                      <ErrorMessage name="tagnumber" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        {t('createUser.password')} {!isEditMode && <span className="text-red-500">*</span>}
                        {isEditMode && <span className="text-sm text-gray-500 font-normal">{t('createUser.leaveBlank')}</span>}
                      </Label>
                      <div className="relative">
                        <Field
                          as={Input}
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={isEditMode ? t('createUser.enterNewPassword') : t('createUser.enterPassword')}
                          className={`bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 pr-10 ${
                            errors.password && touched.password ? 'border-red-500 focus:border-red-500' : ''
                          }`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700 z-10"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                        </Button>
                      </div>
                      <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="submit"
                      disabled={isLoading || isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1 h-11"
                    >
                      {(isLoading || isSubmitting) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isEditMode ? t('createUser.processing') : t('createUser.processing')}
                        </>
                      ) : (
                        <>
                          {isEditMode ? (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              {t('createUser.update')} {isSuperAdminPath ? t('createUser.admin') : t('createUser.user')}
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-2" />
                              {t('createUser.create')} {isSuperAdminPath ? t('createUser.admin') : t('createUser.user')}
                            </>
                          )}
                        </>
                      )}
                    </Button>
                    
                    <Link to={backToPath} className="flex-1">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full h-11 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        disabled={isLoading || isSubmitting}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('common.cancel')}
                      </Button>
                    </Link>
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

export default Createuser