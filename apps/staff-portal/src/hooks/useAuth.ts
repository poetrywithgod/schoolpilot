import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useSchoolStore } from '../store/schoolStore'

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, setLoading, signOut } =
    useAuthStore()
  const { setSchool } = useSchoolStore()
  const navigate = useNavigate()

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Fetch staff record
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('auth_id', data.user.id)
        .single()

      if (staffError || !staffData) {
        await supabase.auth.signOut()
        throw new Error('Staff record not found')
      }

      if (!staffData.is_active) {
        await supabase.auth.signOut()
        throw new Error('Your account has been deactivated')
      }

      // Fetch school record
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', staffData.school_id)
        .single()

      if (schoolError || !schoolData) {
        await supabase.auth.signOut()
        throw new Error('School not found')
      }

      if (!schoolData.is_active) {
        await supabase.auth.signOut()
        throw new Error('School account is inactive. Please contact support.')
      }

      // Set auth user
      setUser({
        id: staffData.id,
        email: staffData.email,
        firstName: staffData.first_name,
        lastName: staffData.last_name,
        role: staffData.role,
        schoolId: staffData.school_id,
      })

      // Set school
      setSchool({
        id: schoolData.id,
        name: schoolData.name,
        slug: schoolData.slug,
        logoUrl: schoolData.logo_url,
        address: schoolData.address,
        phone: schoolData.phone,
        email: schoolData.email,
        subscriptionTier: schoolData.subscription_tier,
        subscriptionExpiresAt: schoolData.subscription_expires_at,
      })

      navigate('/dashboard')
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut: handleSignOut,
  }
}