// src/router/Router.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import OwnerListView from "./view/owner/OwnerListView";
import CreateOwnerView from "./view/owner/CreateOwnerView";
import OwnerDatailView from "./view/owner/OwnerDetailView";
import PatientListView from "./view/patient/PatientListView";
import CreatePatientView from "./view/patient/CreatePatientView";
import PatientDetailView from "./view/patient/PatientDetailView";
import EditPatientView from "./view/patient/EditPatientView";
import CreateLabExamView from "./view/labExams/CreateLabExamView";
import LabExamDetailView from "./view/labExams/LabExamDetailView";
import GroomingServicesView from "./view/grooming/GroomingServicesView"; 
import AuthLayout from "./layout/AuthLayout";
import HomeView from "./view/home/HomeView";
import CreateAppointmentView from "./view/appointment/CreateAppointmentView";
import LabExamListView from "./view/labExams/labExamListView";
import LoginView from "./view/auth/LoginView";
import RegisterView from "./view/auth/RegisterView";
import ConfirmAccountView from "./view/auth/ConfirmAccountView";
import RequestNewToken from "./view/auth/RequestNewToken";
import ForgotPasswordView from "./view/auth/ForgotPasswordView";
import NewPasswordView from "./view/auth/NewPasswordView";
import CreateGroomingServiceView from "./view/grooming/CreateGroomingServiceView";
import CreatePaymentMethodView from "./view/payment/CreatePaymentMethodView";
import PaymentMethodsView from "./view/payment/PaymentMethodsView";
import EditOwnerView from "./view/owner/EditOwnerView";
import GroomingDetailView from "./view/grooming/GroomingDetailView";
import EditGroomingServiceView from "./view/grooming/EditGroomingServiceView";
import GroomingReportView from "./view/grooming/GroomingReportView";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas (Auth) */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginView />} />
          <Route path="/auth/register" element={<RegisterView />} />
          <Route path="/auth/confirm-account" element={<ConfirmAccountView />} />
          <Route path="/auth/request-new-token" element={<RequestNewToken />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordView />} />
          <Route path="/auth/new-password" element={<NewPasswordView />} />
        </Route>

        {/* Rutas Protegidas (App) */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomeView />} index />

          {/* ==================== */}
          {/* GRUPO 1: RUTAS DE OWNERS */}
          {/* ==================== */}
          <Route path="/owners">
            <Route index element={<OwnerListView />} />
            <Route path="new" element={<CreateOwnerView />} />
            <Route path=":ownerId">
              <Route index element={<OwnerDatailView />} />
              <Route path="edit" element={<EditOwnerView />} />
              {/* ✅ RUTA CRÍTICA: Aislada dentro del grupo owners */}
              <Route path="patients/new" element={<CreatePatientView />} />
            </Route>
          </Route>

          {/* ==================== */}
          {/* GRUPO 2: RUTAS DE PATIENTS */}
          {/* ==================== */}
          <Route path="/patients">
            <Route index element={<PatientListView />} />
            <Route path=":patientId">
              <Route index element={<PatientDetailView />} />
              <Route path="edit" element={<EditPatientView />} />
              
              {/* Sub-rutas de pacientes */}
              <Route path="lab-exams">
                <Route index element={<LabExamListView />} />
                <Route path="create" element={<CreateLabExamView />} />
                <Route path=":labExamId" element={<LabExamDetailView />} />
              </Route>
              
              <Route path="appointments/create" element={<CreateAppointmentView />} />
              
              <Route path="grooming-services">
                <Route path="create" element={<CreateGroomingServiceView />} />
                <Route path=":serviceId">
                  <Route index element={<GroomingDetailView />} />
                  <Route path="edit" element={<EditGroomingServiceView />} />
                </Route>
              </Route>
            </Route>
          </Route>

          {/* ==================== */}
          {/* GRUPO 3: RUTAS INDEPENDIENTES */}
          {/* ==================== */}
          <Route path="/grooming-services" element={<GroomingServicesView />} />
          <Route path="/grooming/report" element={<GroomingReportView />} />

          {/* ==================== */}
          {/* GRUPO 4: RUTAS DE PAYMENT - ÚLTIMAS */}
          {/* ==================== */}
          <Route path="/payment-methods" element={<PaymentMethodsView />} />
          <Route path="/payment-methods/new" element={<CreatePaymentMethodView />} />
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">404 - Página no encontrada</h1>
              <p className="text-gray-600">La página que buscas no existe.</p>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}