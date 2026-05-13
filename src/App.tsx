import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useSettings } from './hooks/useSettings';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import PlanSelection from './pages/PlanSelection';
import PaymentPage from './pages/PaymentPage';
import ProfileSetup from './pages/ProfileSetup';
import { LoadingScreen } from './components/LoadingScreen';
import AdminQuickNav from './components/AdminQuickNav';
import { Package2, User as UserIcon, LayoutDashboard, Utensils, ShieldCheck } from 'lucide-react';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './lib/firebase';

function App() {
  const { user, profile, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();
  const [loadingDone, setLoadingDone] = useState(false);
  const [cloudConnected, setCloudConnected] = useState<boolean | null>(null);

  useEffect(() => {
    // If there's no loading video, we still want to show the splash for at least 3 seconds
    if (!settingsLoading && !settings?.loadingVideoUrl) {
      const timer = setTimeout(() => {
        setLoadingDone(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [settingsLoading, settings?.loadingVideoUrl]);

  useEffect(() => {
    // Mandated Firestore connection test
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setCloudConnected(true);
        console.log("Cloud Infrastructure: CONNECTED");
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
          setCloudConnected(false);
        } else {
          // It's okay if the document doesn't exist, as long as it reached the server
          setCloudConnected(true);
        }
      }
    }
    testConnection();
  }, []);

  if (authLoading || settingsLoading || !loadingDone) {
    return (
      <LoadingScreen 
        customUrl={settings?.loadingUrl} 
        videoUrl={settings?.loadingVideoUrl} 
        logoUrl={settings?.logoUrl}
        onFinished={() => setLoadingDone(true)}
      />
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              user ? (
                profile?.role === 'admin' ? <AdminDashboard /> : 
                profile?.role === 'kitchen' ? <KitchenDashboard /> : 
                (!profile?.phone || !profile?.address) ? <Navigate to="/setup" /> :
                profile?.planStatus === 'none' ? <Navigate to="/plans" /> :
                profile?.planStatus === 'pending' ? <PaymentPage /> :
                <UserDashboard />
              ) : <Navigate to="/login" />
            } 
          />
          
          <Route path="/plans" element={user ? <PlanSelection /> : <Navigate to="/login" />} />
          <Route path="/payment" element={user ? <PaymentPage /> : <Navigate to="/login" />} />
          <Route path="/setup" element={user ? <ProfileSetup /> : <Navigate to="/login" />} />
          <Route path="/kitchen" element={profile?.role === 'admin' || profile?.role === 'kitchen' ? <KitchenDashboard /> : <Navigate to="/" />} />
          <Route path="/admin" element={profile?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/user-view" element={profile?.role === 'admin' ? <UserDashboard /> : <Navigate to="/" />} />
        </Routes>
        {profile?.role === 'admin' && <AdminQuickNav />}
      </div>
    </BrowserRouter>
  );
}

export default App;
