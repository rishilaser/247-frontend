import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { QuotationProvider } from './contexts/QuotationContext';
import ErrorBoundary from './components/ErrorBoundary';

// Components - Keep frequently used ones as regular imports
import Header from './components/layout/Header';
import InternalHeader from './components/layout/InternalHeader';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';

// Pages - Lazy load for faster initial page load
const Home = lazy(() => import('./pages/Home'));
const SignUp = lazy(() => import('./pages/auth/SignUp'));
const Login = lazy(() => import('./pages/auth/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NewInquiry = lazy(() => import('./pages/inquiry/NewInquiry'));
const InquiryList = lazy(() => import('./pages/inquiry/InquiryList'));
const InquiryDetail = lazy(() => import('./pages/inquiry/InquiryDetail'));
const OrderList = lazy(() => import('./pages/order/OrderList'));
const OrderDetail = lazy(() => import('./pages/order/OrderDetail'));
const OrderTracking = lazy(() => import('./pages/order/OrderTracking'));
const PaymentPage = lazy(() => import('./pages/order/PaymentPage'));
const BackOfficeDashboard = lazy(() => import('./pages/BackOfficeDashboard'));
const BackOfficeMaterialManagement = lazy(() => import('./pages/BackOfficeMaterialManagement'));
const ComponentManagerPage = lazy(() => import('./pages/ComponentManagerPage'));
const ComponentManagerDetail = lazy(() => import('./pages/ComponentManagerDetail'));
const QuotationResponse = lazy(() => import('./pages/inquiry/QuotationResponse'));
const QuotationPayment = lazy(() => import('./pages/payment/QuotationPayment'));
const OrderManagement = lazy(() => import('./pages/order/OrderManagement'));
const ServiceContact = lazy(() => import('./pages/ServiceContact'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Profile = lazy(() => import('./pages/Profile'));
const Parts = lazy(() => import('./pages/Parts'));
const Tools = lazy(() => import('./pages/Tools'));
const Upload = lazy(() => import('./pages/Upload'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
// Blogs and FAQ are part of the Home page as per user request
// const Blogs = lazy(() => import('./pages/Blogs'));
// const FAQ = lazy(() => import('./pages/FAQ'));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};


// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
);

// Create a client with optimized caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 300000, // Keep unused data in cache for 5 minutes
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" /> : children;
};

// Layout Component
const Layout = ({ children, isInternal = false }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isAdminPage = location.pathname.startsWith('/admin/') ||
    location.pathname.startsWith('/component-manager');

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthPage && (isInternal ? <InternalHeader /> : <Header />)}
      <main className={isAuthPage ? '' : isAdminPage ? 'pt-2 pb-0' : 'pt-2 pb-80'}>
        {children}
      </main>
      {!isAuthPage && !isAdminPage && <Footer />}
    </div>
  );
};

// InquiryList Wrapper - Uses AdminLayout for all users (admin and customer)
const InquiryListWrapper = () => {
  return (
    <AdminLayout>
      <InquiryList />
    </AdminLayout>
  );
};

// Profile Wrapper - Uses AdminLayout for all users (admin and customer)
const ProfileWrapper = () => {
  return (
    <AdminLayout>
      <Profile />
    </AdminLayout>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <QuotationProvider>
            <Router>
              <ScrollToTop />
              <div className="App">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    {/* <Route path="/about" element={
                      <Layout>
                        <About />
                      </Layout>
                    } /> */}
                    <Route path="/services" element={
                      <Layout>
                        <Services />
                      </Layout>
                    } />
                    <Route path="/parts" element={
                      <Layout>
                        <Parts />
                      </Layout>
                    } />
                    <Route path="/tools" element={
                      <Layout>
                        <Tools />
                      </Layout>
                    } />
                    <Route path="/upload" element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <Upload />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/contact" element={
                      <Layout>
                        <ServiceContact />
                      </Layout>
                    } />

                    {/* Auth Routes */}
                    <Route path="/login" element={
                      <PublicRoute>
                        <Layout>
                          <Login />
                        </Layout>
                      </PublicRoute>
                    } />
                    <Route path="/signup" element={
                      <PublicRoute>
                        <Layout>
                          <SignUp />
                        </Layout>
                      </PublicRoute>
                    } />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <Dashboard />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <ProfileWrapper />
                      </ProtectedRoute>
                    } />

                    {/* Inquiry Routes */}
                    <Route path="/inquiry/new" element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <NewInquiry />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/inquiries" element={
                      <ProtectedRoute>
                        <InquiryListWrapper />
                      </ProtectedRoute>
                    } />
                    <Route path="/inquiry/:id" element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <InquiryDetail />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/quotation/:id" element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <QuotationResponse />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/quotation/:id/response" element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <QuotationResponse />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/quotation/:id/payment" element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <QuotationPayment />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />

                    {/* Order Routes */}
                    <Route path="/orders" element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <OrderList />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/order/:id" element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <OrderDetail />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/order/:id/tracking" element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <OrderTracking />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/order/:id/payment" element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <PaymentPage />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin/dashboard" element={
                      <ProtectedRoute>
                        <Layout isInternal>
                          <BackOfficeDashboard />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/orders" element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <OrderManagement />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/material-management" element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <BackOfficeMaterialManagement />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />

                    {/* Component Manager Routes */}
                    <Route path="/component-manager" element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <ComponentManagerPage />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/component-manager/:id" element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <ComponentManagerDetail />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />

                    <Route path="/privacy-policy" element={
                      <Layout>
                        <PrivacyPolicy />
                      </Layout>
                    } />
                    <Route path="/terms-and-conditions" element={
                      <Layout>
                        <TermsAndConditions />
                      </Layout>
                    } />
                    {/* Redirecting Blogs and FAQ to home page sections */}
                    {/* Redirecting Blogs and FAQ to home page sections without hash in URL */}
                    <Route path="/blogs" element={<Navigate to="/" state={{ targetId: 'blog-area' }} replace />} />
                    <Route path="/faq" element={<Navigate to="/" state={{ targetId: 'faq-area' }} replace />} />

                    {/* 404 Route */}
                    <Route path="*" element={
                      <Layout>
                        <NotFound />
                      </Layout>
                    } />
                  </Routes>
                </Suspense>
                <Toaster position="top-right" />
              </div>
            </Router>
          </QuotationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;