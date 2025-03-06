import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

// Define our custom User type that matches what we expect
interface User extends SupabaseUser {
    role: 'student' | 'admin' | 'authenticated';
    user_metadata?: {
        name?: string;
        student_id?: string;
    };
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string, userData: Omit<User, 'id'>) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Separate hook for using the context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Separate component for the provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Convert Supabase User to our User type
    const formatUser = (supabaseUser: SupabaseUser | null): User | null => {
        if (!supabaseUser) return null;
        
        return {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            name: supabaseUser.user_metadata?.name || '',
            role: supabaseUser.user_metadata?.role || 'student',
        };
    };

    useEffect(() => {
        // Get initial session and profile
        const initializeAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // Fetch profile data including role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                setUser({
                    ...session.user,
                    role: profile?.role || 'authenticated'
                });
            }
            setLoading(false);
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                // Fetch profile data including role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                setUser({
                    ...session.user,
                    role: profile?.role || 'authenticated'
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, userData: any) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: 'student',
                        student_id: userData.student_id,
                        room_number: userData.room_number,
                        name: userData.name
                    }
                }
            });

            if (error) throw error;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            setLoading(true);
            console.log('Attempting sign in for:', email);

            // Clear any existing session first
            await supabase.auth.signOut();

            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (authError) throw authError;
            if (!authData.user) throw new Error('No user data returned');

            // Fetch profile with role - with explicit error handling
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', authData.user.id)
                .single();

            if (profileError) {
                console.error('Profile fetch error:', profileError);
                throw new Error('Failed to fetch user profile');
            }

            if (!profileData || !profileData.role) {
                console.error('No role found in profile:', profileData);
                throw new Error('User role not found');
            }

            console.log('Profile data:', profileData);
            console.log('User role:', profileData.role);

            // Set user with role
            const formattedUser = {
                ...authData.user,
                role: profileData.role
            };

            setUser(formattedUser);

            // Handle navigation based on role
            if (profileData.role === 'admin') {
                console.log('Redirecting to admin dashboard...');
                await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure state is updated
                navigate('/admin/dashboard', { replace: true });
            } else if (profileData.role === 'student') {
                navigate('/student', { replace: true });
            } else {
                throw new Error(`Invalid role: ${profileData.role}`);
            }

        } catch (error: any) {
            console.error('Sign in error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setUser(null);
            navigate('/login');
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        signUp,
        signIn,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 