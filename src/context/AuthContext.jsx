import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ALLOWED_STAFF_ROLES = ['manager', 'staff', 'admin']

const AuthContext = createContext(null)

const toAppUser = (authUser, profile) => {
  const metadata = authUser.user_metadata || {}
  const effectiveName = metadata.full_name || profile?.full_name || authUser.email?.split('@')[0] || 'User'
  const effectiveRole = metadata.role || profile?.role || 'customer'
  const effectiveAvatar = metadata.avatar || profile?.avatar || effectiveName.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return {
    id: authUser.id,
    name: effectiveName,
    email: authUser.email,
    role: effectiveRole,
    avatar: effectiveAvatar,
    restaurant: profile?.restaurant,
    joinedAt: profile?.created_at?.slice(0, 10),
    notificationPreferences: profile?.notification_preferences || { orders: true, marketing: false, reports: true },
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (authUser) => {
    const metadata = authUser.user_metadata || {}
    const desiredName = metadata.full_name || authUser.email?.split('@')[0] || 'User'
    const desiredRole = metadata.role || 'customer'
    const initials = desiredName.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'U'
    const desiredAvatar = metadata.avatar || initials

    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()

    if (error) {
      if (error.code === 'PGRST116') {
        setUser(toAppUser(authUser, {
          id: authUser.id,
          full_name: desiredName,
          role: desiredRole,
          avatar: desiredAvatar,
          restaurant: null,
          created_at: authUser.created_at,
        }))
        return
      }
      throw error
    }

    const nextPayload = {}
    if (profile.full_name !== desiredName) nextPayload.full_name = desiredName
    if (profile.avatar !== desiredAvatar) nextPayload.avatar = desiredAvatar

    if (Object.keys(nextPayload).length) {
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(nextPayload)
        .eq('id', authUser.id)
        .select()
        .single()

      if (updateError) throw updateError
      setUser(toAppUser(authUser, updatedProfile))
      return
    }

    setUser(toAppUser(authUser, profile))
  }, [])

  useEffect(() => {
    let active = true
    const initialise = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session && active) {
        try { await loadProfile(session.user) } catch (error) { console.error('Unable to load profile', error) }
      }
      if (active) setLoading(false)
    }
    initialise()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return
      if (!session) { setUser(null); setLoading(false); return }
      try { await loadProfile(session.user) } catch (error) { console.error('Unable to load profile', error) }
      setLoading(false)
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [loadProfile])

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: error.message }
    try { await loadProfile(data.user) } catch (profileError) { return { success: false, error: profileError.message } }
    return { success: true }
  }, [loadProfile])

  const register = useCallback(async ({ name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: 'customer',
        },
      },
    })
    if (error) return { success: false, error: error.message }
    if (!data.session) return { success: false, error: 'Check your email to confirm your account, then sign in.' }
    try { await loadProfile(data.user) } catch (profileError) { return { success: false, error: profileError.message } }
    return { success: true }
  }, [loadProfile])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const createStaffAccount = useCallback(async ({ name, email, password, role }) => {
    if (!user || !['admin'].includes(user.role)) {
      return { success: false, error: 'Only admins can create staff accounts' }
    }

    if (!ALLOWED_STAFF_ROLES.includes(role)) {
      return { success: false, error: 'Invalid role selected' }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role,
        },
      },
    })

    if (error) return { success: false, error: error.message }
    if (!data.session) {
      return { success: true, message: 'Staff account created. Ask the user to confirm their email before signing in.' }
    }

    return { success: true, message: 'Staff account created successfully.' }
  }, [user])

  const updateProfile = useCallback(async (updates) => {
    if (!user) return { success: false, error: 'Not signed in' }
    const payload = {}
    if (updates.name !== undefined) {
      payload.full_name = updates.name
      const { error: metadataError } = await supabase.auth.updateUser({ data: { full_name: updates.name } })
      if (metadataError) return { success: false, error: metadataError.message }
    }
    if (updates.avatar !== undefined) payload.avatar = updates.avatar
    if (updates.restaurant !== undefined) payload.restaurant = updates.restaurant
    const { data, error } = await supabase.from('profiles').update(payload).eq('id', user.id).select().single()
    if (error) return { success: false, error: error.message }
    setUser((current) => ({ ...current, name: data.full_name, avatar: data.avatar, restaurant: data.restaurant }))
    return { success: true }
  }, [user])
const updateNotificationPreferences = useCallback(async (preferences) => {
    if (!user) return { success: false, error: 'Not signed in' }
    const { data, error } = await supabase.rpc('update_notification_preferences', { prefs: preferences })
    if (error) return { success: false, error: error.message }
    setUser((current) => ({ ...current, notificationPreferences: data.notification_preferences }))
    return { success: true }
  }, [user])
  return <AuthContext.Provider value={{ user, loading, login, register, logout, createStaffAccount, updateProfile, updateNotificationPreferences, isAdmin: user?.role === 'admin', isStaff: user?.role === 'admin' || user?.role === 'manager' || user?.role === 'staff' }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
