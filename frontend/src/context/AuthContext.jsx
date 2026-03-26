// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchSubscription(session.user.id)
      setLoading(false)
    })

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchSubscription(session.user.id)
      else setSubscription(null)
    })

    return () => authSub.unsubscribe()
  }, [])

  async function fetchSubscription(userId) {
    // Will be replaced with actual API call
    // For now, check user metadata
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()
    setSubscription(data)
  }

  const value = {
    user,
    session,
    loading,
    subscription,
    isSubscribed: !!subscription,
    isAdmin: user?.user_metadata?.role === 'admin',
    signOut: () => supabase.auth.signOut(),
    refreshSubscription: () => user && fetchSubscription(user.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)