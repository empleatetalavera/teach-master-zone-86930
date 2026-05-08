import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { BrandingProvider } from "@/hooks/useBranding";
import { CartProvider } from "@/hooks/useCart";
import { PreferencesProvider } from "@/hooks/useUserPreferences";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AIAssistant } from "@/components/AIAssistant";
import { GradeNotificationToast } from "@/components/GradeNotificationToast";
import { useSessionTracker } from "@/hooks/useSessionTracker";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Platform from "./pages/Platform";
import Features from "./pages/Features";
import CaseStudies from "./pages/CaseStudies";
import Documentation from "./pages/Documentation";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Support from "./pages/Support";
import Checkout from "./pages/Checkout";
import PaymentInstructions from "./pages/PaymentInstructions";
import Demo from "./pages/Demo";
import TestAccounts from "./pages/TestAccounts";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import CourseView from "./pages/CourseView";
import ModuleView from "./pages/ModuleView";
import EvaluationView from "./pages/EvaluationView";
import ActivityView from "./pages/ActivityView";
import ScormFullscreen from "./pages/ScormFullscreen";
import CampusGuide from "./pages/CampusGuide";
import AdminShopOrders from "./pages/dashboard/AdminShopOrders";
import AdminPaymentSettings from "./pages/dashboard/AdminPaymentSettings";
import AdminSionlineSettings from "./pages/dashboard/AdminSionlineSettings";
import SeguimientoSEPE from "./pages/SeguimientoSEPE";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminTrainingCenters from "./pages/dashboard/AdminTrainingCenters";
import AdminLicenses from "./pages/dashboard/AdminLicenses";
import AdminBilling from "./pages/dashboard/AdminBilling";
import AdminContentOrders from "./pages/dashboard/AdminContentOrders";
import AdminSettings from "./pages/dashboard/AdminSettings";
import AdminAIAnalytics from "./pages/dashboard/AdminAIAnalytics";
import AdminTraceability from "./pages/dashboard/AdminTraceability";
import AdminUsers from "./pages/dashboard/AdminUsers";
import AdminSupport from "./pages/dashboard/AdminSupport";
import AdminCourseSettings from "./pages/dashboard/AdminCourseSettings";
import AdminCourses from "./pages/dashboard/AdminCourses";
import AdminCourseCreator from "./pages/dashboard/AdminCourseCreator";
import AdminCourseEdit from "./pages/dashboard/AdminCourseEdit";
import CourseContentEditor from "./pages/dashboard/CourseContentEditor";
import AdminCourseCatalog from "./pages/dashboard/AdminCourseCatalog";
import CenterSettings from "./pages/dashboard/CenterSettings";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import TeacherCourses from "./pages/dashboard/TeacherCourses";
import TeacherStudents from "./pages/dashboard/TeacherStudents";
import CourseDetailSEPE from "./pages/dashboard/CourseDetailSEPE";
import TeacherStudentDetail from "./pages/dashboard/TeacherStudentDetail";
import TeacherReports from "./pages/dashboard/TeacherReports";
import TeacherTeamAndStudents from "./pages/dashboard/TeacherTeamAndStudents";
import TeacherProfile from "./pages/dashboard/TeacherProfile";
import TeacherCalendar from "./pages/dashboard/TeacherCalendar";
import AlertSettings from "./pages/dashboard/AlertSettings";
import TestNotifications from "./pages/dashboard/TestNotifications";
import QuickResponseManager from "./pages/dashboard/QuickResponseManager";
import TeacherActivityGrading from "./pages/dashboard/TeacherActivityGrading";
import TeacherTutorGuide from "./pages/dashboard/TeacherTutorGuide";
import CourseTutorGuide from "./pages/dashboard/CourseTutorGuide";
import StudentCourses from "./pages/dashboard/StudentCourses";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import StudentSupport from "./pages/dashboard/StudentSupport";
import StudentClassroom from "./pages/dashboard/StudentClassroom";
import StudentEvaluations from "./pages/dashboard/StudentEvaluations";
import StudentGrades from "./pages/dashboard/StudentGrades";
import StudentCertificates from "./pages/dashboard/StudentCertificates";
import StudentGuides from "./pages/dashboard/StudentGuides";
import AuditorDashboard from "./pages/dashboard/AuditorDashboard";
import AuditorCourses from "./pages/dashboard/AuditorCourses";
import AuditorReports from "./pages/dashboard/AuditorReports";
import AdminContracts from "./pages/dashboard/AdminContracts";
import VerifyCertificate from "./pages/VerifyCertificate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  useSessionTracker();
  useIdleTimeout();
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/platform" element={<Platform />} />
        <Route path="/features" element={<Features />} />
        <Route path="/case-studies" element={<CaseStudies />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/support" element={<Support />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/test-accounts" element={<TestAccounts />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment-instructions" element={<PaymentInstructions />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/course/:courseId" element={<ProtectedRoute><CourseView /></ProtectedRoute>} />
        <Route path="/course/:courseId/module/:moduleId" element={<ProtectedRoute><ModuleView /></ProtectedRoute>} />
        <Route path="/course/:courseId/evaluation/:evaluationId" element={<ProtectedRoute><EvaluationView /></ProtectedRoute>} />
        <Route path="/course/:courseId/activity/:activityId" element={<ProtectedRoute><ActivityView /></ProtectedRoute>} />
        <Route path="/campus-guide" element={<CampusGuide />} />
        <Route path="/seguimiento-sepe" element={<SeguimientoSEPE />} />
        <Route path="/verificar-diploma/:code" element={<VerifyCertificate />} />
        <Route path="/verificar-diploma" element={<VerifyCertificate />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/center-settings" element={<CenterSettings />} />
          <Route path="admin/centers" element={<AdminTrainingCenters />} />
          <Route path="admin/licenses" element={<AdminLicenses />} />
          <Route path="admin/contracts" element={<AdminContracts />} />
          <Route path="admin/billing" element={<AdminBilling />} />
          <Route path="admin/orders" element={<AdminContentOrders />} />
          <Route path="admin/shop-orders" element={<AdminShopOrders />} />
          <Route path="admin/payment-settings" element={<AdminPaymentSettings />} />
          <Route path="admin/sionline" element={<AdminSionlineSettings />} />
          <Route path="admin/ai-analytics" element={<AdminAIAnalytics />} />
          <Route path="admin/traceability" element={<AdminTraceability />} />
          <Route path="admin/users" element={<AdminUsers />} />
          <Route path="admin/support" element={<AdminSupport />} />
          <Route path="admin/settings" element={<AdminSettings />} />
          <Route path="admin/courses" element={<AdminCourses />} />
          <Route path="admin/course-catalog" element={<AdminCourseCatalog />} />
          <Route path="admin/courses/create" element={<AdminCourseCreator />} />
          <Route path="admin/courses/:courseId/edit" element={<AdminCourseEdit />} />
          <Route path="admin/courses/:courseId/content" element={<CourseContentEditor />} />
          <Route path="admin/course-settings" element={<AdminCourseSettings />} />
          <Route path="admin/course-settings/:courseId" element={<AdminCourseSettings />} />
          <Route path="admin/test-notifications" element={<TestNotifications />} />
          <Route path="admin/reports" element={<TeacherReports />} />
          <Route path="teacher" element={<TeacherDashboard />} />
          <Route path="teacher/courses" element={<TeacherCourses />} />
          <Route path="teacher/courses/:courseId" element={<CourseDetailSEPE />} />
          <Route path="teacher/courses/:courseId/edit" element={<CourseContentEditor />} />
          <Route path="teacher/students" element={<TeacherStudents />} />
          <Route path="teacher/team" element={<TeacherTeamAndStudents />} />
          <Route path="teacher/students/:studentId" element={<TeacherStudentDetail />} />
          <Route path="teacher/reports" element={<TeacherReports />} />
          <Route path="teacher/profile" element={<TeacherProfile />} />
          <Route path="teacher/calendar" element={<TeacherCalendar />} />
          <Route path="teacher/alerts" element={<AlertSettings />} />
          <Route path="teacher/quick-responses" element={<QuickResponseManager />} />
          <Route path="teacher/grade-activities" element={<TeacherActivityGrading />} />
          <Route path="teacher/tutor-guide" element={<TeacherTutorGuide />} />
          <Route path="teacher/courses/:courseId/tutor-guide" element={<CourseTutorGuide />} />
          <Route path="teacher/course-settings" element={<AdminCourseSettings />} />
          <Route path="teacher/course-settings/:courseId" element={<AdminCourseSettings />} />
          <Route path="teacher/support" element={<AdminSupport />} />
          <Route path="student" element={<StudentDashboard />} />
          <Route path="student/courses" element={<StudentCourses />} />
          <Route path="student/classroom" element={<StudentClassroom />} />
          <Route path="student/evaluations" element={<StudentEvaluations />} />
          <Route path="student/grades" element={<StudentGrades />} />
          <Route path="student/certificates" element={<StudentCertificates />} />
          <Route path="student/support" element={<StudentSupport />} />
          <Route path="guias" element={<StudentGuides />} />
          <Route path="auditor" element={<AuditorDashboard />} />
          <Route path="auditor/courses" element={<AuditorCourses />} />
          <Route path="auditor/traceability" element={<AdminTraceability />} />
          <Route path="auditor/students" element={<TeacherStudents />} />
          <Route path="auditor/students/:studentId" element={<TeacherStudentDetail />} />
          <Route path="auditor/reports" element={<TeacherReports />} />
          <Route path="auditor/report-logs" element={<AuditorReports />} />
          <Route path="auditor/communications" element={<AdminSupport />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AIAssistant />
      <GradeNotificationToast />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <BrandingProvider>
            <PreferencesProvider>
              <CartProvider>
                <AppRoutes />
              </CartProvider>
            </PreferencesProvider>
          </BrandingProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
