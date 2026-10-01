import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import type { UserRole } from '../types';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  organization_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  address?: string;
  city?: string;
  email?: string;
  vehicle_type?: string;
}

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  organizationName?: string;
  phone?: string;
  address?: string;
  city?: string;
  vehicleType?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  loading: boolean;
  error: string | null;
  isPasswordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; user?: User | null; profile?: UserProfile | null; error?: string; role?: UserRole }>;
  signUp: (params: SignUpParams) => Promise<{ success: boolean; user?: User | null; profile?: UserProfile | null; error?: string; requireVerification?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  clearPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  // Helper to ensure role-specific table records exist
  const syncRoleSpecificTable = useCallback(async (userId: string, userRole: UserRole, meta: any) => {
    if (!supabase) return;

    try {
      if (userRole === 'restaurant') {
        const { data: existingRest } = await supabase
          .from('restaurants')
          .select('id')
          .or(`profile_id.eq.${userId},owner_id.eq.${userId}`)
          .maybeSingle();

        if (!existingRest) {
          await supabase.from('restaurants').insert({
            profile_id: userId,
            owner_id: userId,
            name: meta.organization_name || meta.full_name || 'Restaurant Kitchen',
            restaurant_name: meta.organization_name || meta.full_name || 'Restaurant Kitchen',
            address: meta.address || 'Commercial Kitchen Block',
            city: meta.city || 'New Delhi',
            contact_phone: meta.phone || '',
            business_phone: meta.phone || '',
            verified: true,
            verification_status: 'verified',
          });
        }
      } else if (userRole === 'ngo') {
        const { data: existingNgo } = await supabase
          .from('ngos')
          .select('id')
          .or(`profile_id.eq.${userId},owner_id.eq.${userId}`)
          .maybeSingle();

        if (!existingNgo) {
          await supabase.from('ngos').insert({
            profile_id: userId,
            owner_id: userId,
            name: meta.organization_name || meta.full_name || 'Community Shelter',
            organization_name: meta.organization_name || meta.full_name || 'Community Shelter',
            address: meta.address || 'Shelter Hub',
            city: meta.city || 'New Delhi',
            contact_phone: meta.phone || '',
            beneficiary_capacity: 50,
            capacity: 50,
            verified: true,
            verification_status: 'verified',
          });
        }
      } else if (userRole === 'volunteer') {
        const { data: existingVol } = await supabase
          .from('volunteers')
          .select('id')
          .or(`user_id.eq.${userId},profile_id.eq.${userId}`)
          .maybeSingle();

        if (!existingVol) {
          await supabase.from('volunteers').insert({
            user_id: userId,
            profile_id: userId,
            vehicle_type: meta.vehicle_type || 'Bicycle / Courier',
            availability_status: 'available',
            verification_status: 'verified',
          });
        }
      }
    } catch (e) {
      console.warn('[ResQFood Auth] Role record sync notice:', e);
    }
  }, []);

  // Fetch or construct profile from Supabase profiles table
  const fetchProfile = useCallback(async (authUser: User) => {
    if (!supabase) return null;

    try {
      const { data, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileErr) {
        console.warn('[ResQFood Auth] Profile fetch query notice:', profileErr.message);
      }

      let loadedProfile: UserProfile;

      if (data) {
        loadedProfile = {
          id: data.id,
          role: (data.role as UserRole) || (authUser.user_metadata?.role as UserRole) || 'restaurant',
          full_name: data.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          organization_name: data.organization_name || authUser.user_metadata?.organization_name || '',
          phone: data.phone || authUser.user_metadata?.phone || '',
          avatar_url: data.avatar_url || authUser.user_metadata?.avatar_url || '',
          created_at: data.created_at || authUser.created_at,
          updated_at: data.updated_at,
          address: data.address || authUser.user_metadata?.address || '',
          city: data.city || authUser.user_metadata?.city || 'New Delhi',
          email: authUser.email || '',
        };
      } else {
        // Fallback: If trigger hasn't populated profile yet, synthesize from metadata & upsert
        const synthesizedRole = (authUser.user_metadata?.role as UserRole) || 'restaurant';
        loadedProfile = {
          id: authUser.id,
          role: synthesizedRole,
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          organization_name: authUser.user_metadata?.organization_name || '',
          phone: authUser.user_metadata?.phone || '',
          avatar_url: authUser.user_metadata?.avatar_url || '',
          created_at: authUser.created_at,
          address: authUser.user_metadata?.address || '',
          city: authUser.user_metadata?.city || 'New Delhi',
          email: authUser.email || '',
        };

        try {
          await supabase.from('profiles').upsert({
            id: loadedProfile.id,
            role: loadedProfile.role,
            full_name: loadedProfile.full_name,
            organization_name: loadedProfile.organization_name,
            phone: loadedProfile.phone,
            avatar_url: loadedProfile.avatar_url,
            address: loadedProfile.address,
            city: loadedProfile.city,
            updated_at: new Date().toISOString(),
          });
        } catch (upsertErr) {
          console.warn('[ResQFood Auth] Auto-profile creation notice:', upsertErr);
        }
      }

      // Check and sync role-specific records
      await syncRoleSpecificTable(authUser.id, loadedProfile.role, {
        organization_name: loadedProfile.organization_name,
        full_name: loadedProfile.full_name,
        phone: loadedProfile.phone,
        address: loadedProfile.address,
        city: loadedProfile.city,
        vehicle_type: authUser.user_metadata?.vehicle_type,
      });

      // Enrich with role specific details
      if (loadedProfile.role === 'volunteer') {
        try {
          const { data: vol } = await supabase
            .from('volunteers')
            .select('vehicle_type')
            .or(`user_id.eq.${authUser.id},profile_id.eq.${authUser.id}`)
            .maybeSingle();
          if (vol?.vehicle_type) {
            loadedProfile.vehicle_type = vol.vehicle_type;
          }
        } catch {
          // ignore
        }
      } else if (loadedProfile.role === 'restaurant') {
        try {
          const { data: rest } = await supabase
            .from('restaurants')
            .select('name, address, city, contact_phone')
            .or(`profile_id.eq.${authUser.id},owner_id.eq.${authUser.id}`)
            .maybeSingle();
          if (rest) {
            if (rest.name && !loadedProfile.organization_name) loadedProfile.organization_name = rest.name;
            if (rest.address && !loadedProfile.address) loadedProfile.address = rest.address;
            if (rest.city && !loadedProfile.city) loadedProfile.city = rest.city;
            if (rest.contact_phone && !loadedProfile.phone) loadedProfile.phone = rest.contact_phone;
          }
        } catch {
          // ignore
        }
      } else if (loadedProfile.role === 'ngo') {
        try {
          const { data: ngo } = await supabase
            .from('ngos')
            .select('name, address, city, contact_phone')
            .or(`profile_id.eq.${authUser.id},owner_id.eq.${authUser.id}`)
            .maybeSingle();
          if (ngo) {
            if (ngo.name && !loadedProfile.organization_name) loadedProfile.organization_name = ngo.name;
            if (ngo.address && !loadedProfile.address) loadedProfile.address = ngo.address;
            if (ngo.city && !loadedProfile.city) loadedProfile.city = ngo.city;
            if (ngo.contact_phone && !loadedProfile.phone) loadedProfile.phone = ngo.contact_phone;
          }
        } catch {
          // ignore
        }
      }

      setProfile(loadedProfile);
      return loadedProfile;
    } catch (err: any) {
      console.warn('[ResQFood Auth] Exception in fetchProfile:', err);
      const fallback: UserProfile = {
        id: authUser.id,
        role: (authUser.user_metadata?.role as UserRole) || 'restaurant',
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        organization_name: authUser.user_metadata?.organization_name || '',
        phone: authUser.user_metadata?.phone || '',
        created_at: authUser.created_at,
        address: authUser.user_metadata?.address || '',
        city: authUser.user_metadata?.city || 'New Delhi',
        email: authUser.email || '',
      };
      setProfile(fallback);
      return fallback;
    }
  }, [syncRoleSpecificTable]);

  // Initialize session on mount and listen to auth changes
  useEffect(() => {
    let mounted = true;

    // Check URL hash for recovery token
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && (hash.includes('type=recovery') || hash.includes('access_token='))) {
        setIsPasswordRecovery(true);
      }
    }

    const client = supabase;
    if (!client) {
      setIsLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session: existingSession } } = await client.auth.getSession();
        if (mounted && existingSession?.user) {
          setSession(existingSession);
          setUser(existingSession.user);
          await fetchProfile(existingSession.user);
        }
      } catch (err: any) {
        console.warn('[ResQFood Auth] Error fetching initial session:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Listen to Supabase auth events
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }

        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          await fetchProfile(newSession.user);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign In method
  const signIn = async (email: string, password: string) => {
    setError(null);

    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, error: 'Supabase credentials are not configured in .env' };
    }

    try {
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInErr) {
        setError(signInErr.message);
        return { success: false, error: signInErr.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        const userProf = await fetchProfile(data.user);
        return { 
          success: true, 
          user: data.user, 
          profile: userProf, 
          role: userProf?.role || 'restaurant' 
        };
      }

      return { success: false, error: 'Sign in failed. Please verify your credentials.' };
    } catch (err: any) {
      const msg = err.message || 'Network error during sign in';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Sign Up method
  const signUp = async (params: SignUpParams) => {
    setError(null);

    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, error: 'Supabase credentials are not configured in .env' };
    }

    try {
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: params.email.trim(),
        password: params.password,
        options: {
          data: {
            full_name: params.fullName.trim(),
            role: params.role,
            organization_name: params.organizationName?.trim() || '',
            phone: params.phone?.trim() || '',
            address: params.address?.trim() || '',
            city: params.city?.trim() || 'New Delhi',
            vehicle_type: params.vehicleType || 'Bicycle / Courier',
          },
        },
      });

      if (signUpErr) {
        setError(signUpErr.message);
        return { success: false, error: signUpErr.message };
      }

      if (data.user) {
        // Guarantee database rows creation on client side immediately
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            role: params.role,
            full_name: params.fullName.trim(),
            organization_name: params.organizationName?.trim() || '',
            phone: params.phone?.trim() || '',
            address: params.address?.trim() || '',
            city: params.city?.trim() || 'New Delhi',
            updated_at: new Date().toISOString(),
          });

          await syncRoleSpecificTable(data.user.id, params.role, {
            organization_name: params.organizationName?.trim(),
            full_name: params.fullName.trim(),
            phone: params.phone?.trim(),
            address: params.address?.trim(),
            city: params.city?.trim(),
            vehicle_type: params.vehicleType,
          });
        } catch (syncErr) {
          console.warn('[ResQFood Auth] Client direct provisioning notice:', syncErr);
        }

        // Check if email confirmation is required
        if (!data.session) {
          return { success: true, user: data.user, profile: null, requireVerification: true };
        }

        setUser(data.user);
        setSession(data.session);
        const userProf = await fetchProfile(data.user);
        return { success: true, user: data.user, profile: userProf, requireVerification: false };
      }

      return { success: false, error: 'Registration could not be completed.' };
    } catch (err: any) {
      const msg = err.message || 'Network error during registration';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Sign Out method
  const signOut = async () => {
    setError(null);
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[ResQFood Auth] SignOut error notice:', err);
      }
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // Reset password via email
  const resetPassword = async (email: string) => {
    setError(null);
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const redirectTo = typeof window !== 'undefined' 
        ? `${window.location.origin}/#reset-password` 
        : undefined;

      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (resetErr) {
        setError(resetErr.message);
        return { success: false, error: resetErr.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error sending reset email' };
    }
  };

  // Update password
  const updatePassword = async (newPassword: string) => {
    setError(null);
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) {
        setError(updateErr.message);
        return { success: false, error: updateErr.message };
      }

      setIsPasswordRecovery(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error updating password' };
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !supabase) {
      return { success: false, error: 'No authenticated user to update' };
    }

    try {
      // 1. Update profiles table
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          organization_name: updates.organization_name,
          phone: updates.phone,
          avatar_url: updates.avatar_url,
          address: updates.address,
          city: updates.city,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateErr) {
        console.warn('[ResQFood Auth] profiles update notice:', updateErr);
      }

      // 2. Update role-specific records
      const userRole = profile?.role || 'restaurant';
      if (userRole === 'restaurant') {
        await supabase
          .from('restaurants')
          .update({
            name: updates.organization_name,
            restaurant_name: updates.organization_name,
            address: updates.address,
            contact_phone: updates.phone,
            business_phone: updates.phone,
            city: updates.city,
            updated_at: new Date().toISOString(),
          })
          .or(`profile_id.eq.${user.id},owner_id.eq.${user.id}`);
      } else if (userRole === 'ngo') {
        await supabase
          .from('ngos')
          .update({
            name: updates.organization_name,
            organization_name: updates.organization_name,
            address: updates.address,
            contact_phone: updates.phone,
            city: updates.city,
            updated_at: new Date().toISOString(),
          })
          .or(`profile_id.eq.${user.id},owner_id.eq.${user.id}`);
      } else if (userRole === 'volunteer') {
        await supabase
          .from('volunteers')
          .update({
            vehicle_type: updates.vehicle_type || 'Bicycle / Courier',
            updated_at: new Date().toISOString(),
          })
          .or(`user_id.eq.${user.id},profile_id.eq.${user.id}`);
      }

      // 3. Update auth user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: updates.full_name,
          organization_name: updates.organization_name,
          phone: updates.phone,
          address: updates.address,
          city: updates.city,
          vehicle_type: updates.vehicle_type,
        }
      });

      // 4. Refresh local profile
      await fetchProfile(user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error updating profile' };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const clearPasswordRecovery = () => {
    setIsPasswordRecovery(false);
  };

  const derivedRole = profile?.role || (user?.user_metadata?.role as UserRole) || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role: derivedRole,
        isLoading,
        loading: isLoading,
        error,
        isPasswordRecovery,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        refreshProfile,
        clearPasswordRecovery,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
