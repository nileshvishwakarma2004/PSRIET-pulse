import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './src/context/AuthContext';
import { CurriculumLockProvider } from './src/context/CurriculumLockContext';

// Main Portal & Courses Imports
import Dashboard from "./src/pages/Dashboard";
import CodingPractice from './src/pages/CodingPractice';
import BaPage from "./src/pages/ba";
import BbaPage from "./src/pages/bba";
import BcaPage from "./src/pages/bca";
import BcomPage from "./src/pages/bcom";
import BedPage from "./src/pages/bed";
import BscPage from "./src/pages/bsc";
import DledPage from "./src/pages/dled";
import LlbPage from "./src/pages/llb";
import MaPage from "./src/pages/ma";
import PrivacyPolicy from './src/pages/PrivacyPolicy';
import TermsConditions from './src/pages/TermsConditions';
import LoginPage from './src/pages/LoginPage';

// Admin Panel Imports & Protected Route
import AdminLogin from './src/pages/AdminLogin';
import AdminDashboard from './src/pages/AdminDashboard';
import ProtectedAdminRoute from './src/components/ProtectedAdminRoute';
import StudentResult from './src/components/StudentResult';

// Support Widget Import
import SupportWidget from './src/components/SupportWidget';

function App() {
    return (
        <AuthProvider>
            <CurriculumLockProvider>
              <Router>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/coding-test" element={<CodingPractice />} />
                    <Route path="/login" element={<LoginPage />} />

                    <Route path="/ba" element={<BaPage />} />
                    <Route path="/bba" element={<BbaPage />} />
                    <Route path="/bca" element={<BcaPage />} />
                    <Route path="/bcom" element={<BcomPage />} />
                    <Route path="/bed" element={<BedPage />} />
                    <Route path="/bsc" element={<BscPage />} />
                    <Route path="/dled" element={<DledPage />} />
                    <Route path="/llb" element={<LlbPage />} />
                    <Route path="/ma" element={<MaPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-conditions" element={<TermsConditions />} />
                    <Route path="/student/result" element={<StudentResult />} />

                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedAdminRoute>
                                <AdminDashboard />
                            </ProtectedAdminRoute>
                        }
                    />
                  </Routes>

                  <SupportWidget />
              </Router>
            </CurriculumLockProvider>
        </AuthProvider>
    );
}

export default App;