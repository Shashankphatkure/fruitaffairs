import { StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';

interface UserProfile {
  id: string;
  email: string;
  phone: string | null;
  full_name: string | null;
  address: string | null;
}

export default function HomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });
  }, []);

  const handleLogin = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleOpenOrders = () => {
    router.push('/orders');
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      // First try to find by user ID
      const { data: dataById, error: errorById } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (errorById) {
        // If not found by ID, try to find by email
        const { data: dataByEmail, error: errorByEmail } = await supabase
          .from('users')
          .select('*')
          .eq('email', session?.user.email)
          .single();

        if (errorByEmail) {
          // If no profile exists at all, create a new one
          const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: userId,
                email: session?.user.email,
                full_name: null,
                phone: null,
                address: null,
              },
            ])
            .select()
            .single();

          if (insertError) {
            console.error('Insert error:', insertError);
            throw insertError;
          }
          setUserProfile(newProfile);
        } else {
          // If found by email but ID doesn't match, update the ID
          const { error: updateError } = await supabase
            .from('users')
            .update({ id: userId })
            .eq('email', session?.user.email);

          if (updateError) throw updateError;
          setUserProfile(dataByEmail);
        }
      } else {
        setUserProfile(dataById);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch or create user profile');
      console.error(error);
    }
  };

  if (session) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Welcome Back!
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Your Profile Details
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.profileContainer}>
          <ThemedView style={styles.profileItem}>
            <ThemedText style={styles.label}>EMAIL</ThemedText>
            <ThemedText style={styles.value}>{session.user.email}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.divider} />
          
          <ThemedView style={styles.profileItem}>
            <ThemedText style={styles.label}>FULL NAME</ThemedText>
            <ThemedText style={styles.value}>
              {userProfile?.full_name || 'Not set'}
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.divider} />
          
          <ThemedView style={styles.profileItem}>
            <ThemedText style={styles.label}>PHONE</ThemedText>
            <ThemedText style={styles.value}>
              {userProfile?.phone || 'Not set'}
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.divider} />
          
          <ThemedView style={styles.profileItem}>
            <ThemedText style={styles.label}>ADDRESS</ThemedText>
            <ThemedText style={styles.value}>
              {userProfile?.address || 'Not set'}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <TouchableOpacity 
          style={styles.ordersButton}
          onPress={handleOpenOrders}
        >
          <ThemedText style={styles.ordersButtonText}>
            SHOW ORDERS
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <ThemedText style={styles.logoutButtonText}>
            LOGOUT
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { justifyContent: 'flex-start', paddingTop: 60 }]}>
      <ThemedText type="title" style={styles.title}>
        Login
      </ThemedText>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <ThemedText style={styles.buttonText}>
          {loading ? 'LOGGING IN...' : 'LOGIN'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: 'white',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: 'white',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  profileContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileItem: {
    paddingVertical: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    width: '100%',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF5252',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5252',
  },
  ordersButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  ordersButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
