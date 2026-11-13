import React from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { RideProvider } from './context/RideContext';
import Navbar from './components/common/Navbar';
import { Loading } from './components/common/Workspace';
import Landing from './pages/auth/Landing';
import Login from './pages/auth/Login';

const SignupRider = React.lazy(() => import('./pages/auth/SignupRider'));
const SignupDriver = React.lazy(() => import('./pages/auth/SignupDriver'));
const VerifyOTP = React.lazy(() => import('./pages/auth/VerifyOTP'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));
const StoryDemo = React.lazy(() => import('./pages/StoryDemo'));
const DemoRideHistory = React.lazy(() => import('./pages/rider/RideHistory'));
const DemoRiderProfile = React.lazy(() => import('./pages/rider/RiderProfile'));
const DemoPaymentScreen = React.lazy(() => import('./pages/rider/PaymentScreen'));
const DemoDriverEarnings = React.lazy(() => import('./pages/driver/DriverEarnings'));
const DemoDriverHistory = React.lazy(() => import('./pages/driver/DriverHistory'));
const DemoDriverProfile = React.lazy(() => import('./pages/driver/DriverProfile'));
const RiderBooking = React.lazy(() => import('./pages/rider/RiderBooking'));
const RiderTrip = React.lazy(() => import('./pages/rider/RiderTrip'));
const DriverTrip = React.lazy(() => import('./pages/driver/DriverWorkspace').then((module) => ({ default: module.DriverTrip })));
const DriverWorkspace = React.lazy(() => import('./pages/driver/DriverWorkspace').then((module) => ({ default: module.DriverWorkspace })));
const AccountHistory = React.lazy(() => import('./pages/AccountRecords').then((module) => ({ default: module.AccountHistory })));
const AccountProfile = React.lazy(() => import('./pages/AccountRecords').then((module) => ({ default: module.AccountProfile })));
const DriverEarnings = React.lazy(() => import('./pages/AccountRecords').then((module) => ({ default: module.DriverEarnings })));
const AdminOverview = React.lazy(() => import('./pages/admin/AdminWorkspace').then((module) => ({ default: module.AdminOverview })));
const AdminRecords = React.lazy(() => import('./pages/admin/AdminWorkspace').then((module) => ({ default: module.AdminRecords })));

function RoleWorkspace({ role }) {
  const { user, token } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={'/' + user.role} replace />;
  return (
    <RideProvider key={token + ':' + role}>
      <Navbar />
      <main id="main-content"><Outlet /></main>
    </RideProvider>
  );
}

export default function App() {
  const { token, user, loading } = useAuth();
  const { pathname } = useLocation();
  const demo = token === 'demo-token';

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (loading && token && !user) return <div className="rg-initial"><Loading>Loading RideGo…</Loading></div>;

  return (
    <React.Suspense fallback={<div className="rg-initial"><Loading>Loading page…</Loading></div>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/story-demo" element={<StoryDemo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup/rider" element={<SignupRider />} />
        <Route path="/signup/driver" element={<SignupDriver />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/rider" element={<RoleWorkspace role="rider" />}>
          <Route index element={<RiderBooking key="home" step={0} />} />
          <Route path="search" element={<RiderBooking key="locations" step={0} />} />
          <Route path="choose-ride" element={<RiderBooking key="vehicle" step={1} />} />
          <Route path="confirm" element={<RiderBooking key="confirm" step={2} />} />
          {['finding-driver', 'driver-assigned', 'tracking', 'completed'].map((path) => <Route key={path} path={path} element={<RiderTrip />} />)}
          <Route path="history" element={demo ? <DemoRideHistory /> : <AccountHistory />} />
          <Route path="profile" element={demo ? <DemoRiderProfile /> : <AccountProfile />} />
          <Route path="payments" element={demo ? <DemoPaymentScreen /> : <AccountHistory payments />} />
        </Route>

        <Route path="/driver" element={<RoleWorkspace role="driver" />}>
          <Route index element={<DriverWorkspace />} />
          <Route path="incoming" element={<DriverWorkspace requests />} />
          <Route path="navigate-pickup" element={<DriverTrip step={0} />} />
          <Route path="start-ride" element={<DriverTrip step={1} />} />
          <Route path="live-navigation" element={<DriverTrip step={2} />} />
          <Route path="complete" element={<DriverTrip step={3} />} />
          <Route path="earnings" element={demo ? <DemoDriverEarnings /> : <DriverEarnings />} />
          <Route path="history" element={demo ? <DemoDriverHistory /> : <AccountHistory />} />
          <Route path="profile" element={demo ? <DemoDriverProfile /> : <AccountProfile driver />} />
        </Route>

        <Route path="/admin" element={<RoleWorkspace role="admin" />}>
          <Route index element={<AdminOverview />} />
          <Route path="reports" element={<AdminOverview reports />} />
          {['users', 'rides', 'vehicles', 'payments', 'promos'].map((type) => <Route key={type} path={type} element={<AdminRecords key={type} type={type} />} />)}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
}

