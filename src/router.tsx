// src/router/Router.tsx

import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import AuthLayout from "./layout/AuthLayout";

// Vistas de Auth
import LoginView from "./view/auth/LoginView";
import RegisterView from "./view/auth/RegisterView";
import ConfirmAccountView from "./view/auth/ConfirmAccountView";
import RequestNewToken from "./view/auth/RequestNewToken";
import ForgotPasswordView from "./view/auth/ForgotPasswordView";
import NewPasswordView from "./view/auth/NewPasswordView";

// Vistas principales
import HomeView from "./view/home/HomeView";

// Owners
import OwnerListView from "./view/owner/OwnerListView";
import CreateOwnerView from "./view/owner/CreateOwnerView";
import OwnerDatailView from "./view/owner/OwnerDetailView";

// Patients
import PatientListView from "./view/patient/PatientListView";
import CreatePatientView from "./view/patient/CreatePatientView";
import EditPatientView from "./view/patient/EditPatientView";
import PatientDataView from "./view/patient/PatientDataView";
import PatientLayout from "./layout/PatientLayout";

// Lab Exams (INDEPENDIENTES)
import CreateLabExamView from "./view/labExams/CreateLabExamView";
import LabExamDetailView from "./view/labExams/LabExamDetailView";

// Appointments
import CreateAppointmentView from "./view/appointment/CreateAppointmentView";
import AppointmentDetailsView from "./view/appointment/AppointmentDetailsView";
import EditAppointmentView from "./view/appointment/EditAppointmentView";

// Grooming
import GroomingServicesView from "./view/grooming/GroomingServicesView";
import CreateGroomingServiceView from "./view/grooming/CreateGroomingServiceView";
import GroomingDetailView from "./view/grooming/GroomingDetailView";
import EditGroomingServiceView from "./view/grooming/EditGroomingServiceView";
import GroomingReportView from "./view/grooming/GroomingReportView";
import GroomingServiceListView from "./view/grooming/GroomingServiceListView";

// Payment
import PaymentMethodsView from "./view/payment/PaymentMethodsView";
import CreatePaymentMethodView from "./view/payment/CreatePaymentMethodView";
import LabExamListView from "./view/labExams/labExamListView";
import StaffListView from "./view/staff/StaffListView";
import CreateStaffView from "./view/staff/CreateStaffView";
import EditStaffView from "./view/staff/EditStaffView";
import PatientLabExamListView from "./view/labExams/PatientLabExamListView";
import MedicalStudyListView from "./view/medicalStudies/MedicalStudyListView";
import CreateMedicalStudyView from "./view/medicalStudies/CreateMedicalStudyView";
import VaccinationListView from "./view/vaccinations/VaccinationListView";
import CreateVaccinationView from "./view/vaccinations/CreateVaccinationView";
import DewormingListView from "./view/dewormings/DewormingListView";
import CreateDewormingView from "./view/dewormings/CreateDewormingView";
import ConsultationListView from "./view/consultations/ConsultationListView";
import CreateConsultationView from "./view/consultations/CreateConsultationView";
import EditOwnerView from "./view/owner/EditOwnerView";

// Invoices / Reportes
import InvoiceReportView from "./view/invoices/InvoiceReportView";
import AppointmentsView from "./view/appointment/AppointmentsView";
import SelectPatientForAppointment from "./components/appointments/SelectPatientForAppointment";

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
          {/* CITAS (RUTA GLOBAL) ✅ NUEVO */}
          {/* ==================== */}
          <Route path="/appointments">
            <Route index element={<AppointmentsView />} />
            <Route path="select-patient" element={<SelectPatientForAppointment />} />
          </Route>

          {/* EXÁMENES DE LABORATORIO (RUTA INDEPENDIENTE) */}
          <Route path="/lab-exams">
            <Route index element={<LabExamListView />} />
            <Route path="create" element={<CreateLabExamView />} />
            <Route path=":id" element={<LabExamDetailView />} />
          </Route>

          {/* RUTAS DE OWNERS */}
          <Route path="/owners">
            <Route index element={<OwnerListView />} />
            <Route path="new" element={<CreateOwnerView />} />
            <Route path=":ownerId">
              <Route index element={<OwnerDatailView />} />
              <Route path="edit" element={<EditOwnerView />} />
              <Route path="patients/new" element={<CreatePatientView />} />
            </Route>
          </Route>

          {/* RUTAS DE PATIENTS */}
          <Route path="/patients">
            <Route index element={<PatientListView />} />
            <Route path=":patientId" element={<PatientLayout />}>
              <Route index element={<PatientDataView />} />
              <Route path="edit" element={<EditPatientView />} />

              <Route path="studies">
                <Route index element={<MedicalStudyListView />} />
                <Route path="create" element={<CreateMedicalStudyView />} />
              </Route>

              <Route path="vaccinations">
                <Route index element={<VaccinationListView />} />
                <Route path="create" element={<CreateVaccinationView />} />
              </Route>

              <Route path="dewormings">
                <Route index element={<DewormingListView />} />
                <Route path="create" element={<CreateDewormingView />} />
              </Route>

              <Route path="consultations">
                <Route index element={<ConsultationListView />} />
                <Route path="create" element={<CreateConsultationView />} />
              </Route>

              {/* Citas dentro del paciente */}
              <Route path="appointments/create" element={<CreateAppointmentView />} />
              <Route path="appointments/:appointmentId" element={<AppointmentDetailsView />} />
              <Route path="appointments/:appointmentId/edit" element={<EditAppointmentView />} />

              {/* Exámenes (opcional: desde paciente) */}
              <Route path="lab-exams">
                <Route index element={<PatientLabExamListView />} />
                <Route path="create" element={<CreateLabExamView />} />
                <Route path=":labExamId" element={<LabExamDetailView />} />
              </Route>

              {/* Peluquería */}
              <Route path="grooming-services">
                <Route index element={<GroomingServiceListView />} />
                <Route path="create" element={<CreateGroomingServiceView />} />
                <Route path=":serviceId">
                  <Route index element={<GroomingDetailView />} />
                  <Route path="edit" element={<EditGroomingServiceView />} />
                </Route>
              </Route>
            </Route>
          </Route>

          {/* ==================== */}
          {/* RUTAS INDEPENDIENTES */}
          {/* ==================== */}
          <Route path="/grooming-services" element={<GroomingServicesView />} />
          <Route path="/grooming/report" element={<GroomingReportView />} />

          {/* ==================== */}
          {/* REPORTES DE FACTURACIÓN */}
          {/* ==================== */}
          <Route path="/invoices/report" element={<InvoiceReportView />} />

          {/* ==================== */}
          {/* RUTAS DE PAYMENT */}
          {/* ==================== */}
          <Route path="/payment-methods" element={<PaymentMethodsView />} />
          <Route path="/payment-methods/new" element={<CreatePaymentMethodView />} />

          {/* ==================== */}
          {/* RUTAS DE STAFF */}
          {/* ==================== */}
          <Route path="/staff">
            <Route index element={<StaffListView />} />
            <Route path="new" element={<CreateStaffView />} />
            <Route path=":staffId/edit" element={<EditStaffView />} />
          </Route>
        </Route>

        {/* Ruta 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  404 - Página no encontrada
                </h1>
                <p className="text-gray-600">La página que buscas no existe.</p>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}