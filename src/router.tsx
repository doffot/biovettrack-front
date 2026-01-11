// src/router/Router.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import AuthLayout from "./layout/AuthLayout";

// Vista Pública
import LandingView from "./view/public/LandingView";

// Vistas de Auth
import LoginView from "./view/auth/LoginView";
import RegisterView from "./view/auth/RegisterView";
import ConfirmAccountView from "./view/auth/ConfirmAccountView";
import RequestNewToken from "./view/auth/RequestNewToken";
import ForgotPasswordView from "./view/auth/ForgotPasswordView";
import NewPasswordAuthView from "./view/auth/NewPasswordView";

// Vistas principales
import HomeView from "./view/home/HomeView";
import NotificationsView from "./view/notifications/NotificationsView";
import ProfileView from "./view/profile/ProfileView";

// Owners
import OwnerListView from "./view/owner/OwnerListView";
import CreateOwnerView from "./view/owner/CreateOwnerView";
import OwnerDatailView from "./view/owner/OwnerDetailView";
import EditOwnerView from "./view/owner/EditOwnerView";

// Patients
import PatientListView from "./view/patient/PatientListView";
import CreatePatientView from "./view/patient/CreatePatientView";
import EditPatientView from "./view/patient/EditPatientView";
import PatientDataView from "./view/patient/PatientDataView";
import PatientLayout from "./layout/PatientLayout";

// Lab Exams
import CreateLabExamView from "./view/labExams/CreateLabExamView";
import LabExamDetailView from "./view/labExams/LabExamDetailView";
import LabExamListView from "./view/labExams/labExamListView";
import PatientLabExamListView from "./view/labExams/PatientLabExamListView";
import EditLabExamView from "./view/labExams/EditLabExamView";

// Appointments
import CreateAppointmentView from "./view/appointment/CreateAppointmentView";
import AppointmentDetailsView from "./view/appointment/AppointmentDetailsView";
import EditAppointmentView from "./view/appointment/EditAppointmentView";
import AppointmentsView from "./view/appointment/AppointmentsView";
import SelectPatientForAppointment from "./components/appointments/SelectPatientForAppointment";

// Grooming
import GroomingServicesView from "./view/grooming/GroomingServicesView";
import CreateGroomingServiceView from "./view/grooming/CreateGroomingServiceView";
import GroomingDetailView from "./view/grooming/GroomingDetailView";
import EditGroomingServiceView from "./view/grooming/EditGroomingServiceView";
import GroomingReportView from "./view/grooming/GroomingReportView";
import GroomingServiceListView from "./view/grooming/GroomingServiceListView";

// Medical Studies
import MedicalStudyListView from "./view/medicalStudies/MedicalStudyListView";
import CreateMedicalStudyView from "./view/medicalStudies/CreateMedicalStudyView";

// Vaccinations
import VaccinationListView from "./view/vaccinations/VaccinationListView";
import CreateVaccinationView from "./view/vaccinations/CreateVaccinationView";

// Dewormings
import DewormingListView from "./view/dewormings/DewormingListView";
import CreateDewormingView from "./view/dewormings/CreateDewormingView";

// Consultations
import ConsultationListView from "./view/consultations/ConsultationListView";
import CreateConsultationView from "./view/consultations/CreateConsultationView";
import AllConsultationsView from "./view/consultations/AllConsultationsView";

// Recipes
import RecipeListView from "./view/recipes/RecipeListView";
import CreateRecipeView from "./view/recipes/CreateRecipeView";

// Invoices / Reportes
import InvoiceReportView from "./view/invoices/InvoiceReportView";
import InvoiceDetailView from "./view/invoices/InvoiceDetailView";

// Payment
import PaymentMethodsView from "./view/payment/PaymentMethodsView";
import CreatePaymentMethodView from "./view/payment/CreatePaymentMethodView";

// Staff
import StaffListView from "./view/staff/StaffListView";
import CreateStaffView from "./view/staff/CreateStaffView";
import EditStaffView from "./view/staff/EditStaffView";

// Products & Inventory
import ProductListView from "./view/products/ProductListView";
import CreateProductView from "./view/products/CreateProductView";
import EditProductView from "./view/products/EditProductView";

// Purchases (Compras)
import PurchaseListView from "./view/purchases/PurchaseListView";
import CreatePurchaseView from "./view/purchases/CreatePurchaseView";
import InventoryStockView from "./view/inventory/InventoryStockView";
import InventoryMovementsView from "./view/inventory/InventoryMovementsView";
import InventoryLowStockView from "./view/inventory/InventoryLowStockView";

// Sales
import CreateSaleView from "./view/sales/CreateSaleView";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========================================== */}
        {/* LANDING PAGE PÚBLICA */}
        {/* ========================================== */}
        <Route path="/" element={<LandingView />} />

        {/* ========================================== */}
        {/* RUTAS PÚBLICAS (AUTH) */}
        {/* ========================================== */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginView />} />
          <Route path="/auth/register" element={<RegisterView />} />
          <Route path="/auth/confirm-account" element={<ConfirmAccountView />} />
          <Route path="/auth/request-new-token" element={<RequestNewToken />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordView />} />
          <Route path="/auth/new-password" element={<NewPasswordAuthView />} />
        </Route>

        {/* ========================================== */}
        {/* RUTAS PROTEGIDAS (APP) */}
        {/* ========================================== */}
        <Route path="/app" element={<AppLayout />}>
          {/* HOME / DASHBOARD */}
          <Route index element={<HomeView />} />

          {/* PERFIL Y NOTIFICACIONES */}
          <Route path="profile" element={<ProfileView />} />
          <Route path="notifications" element={<NotificationsView />} />

          {/* ==================== */}
          {/* CITAS GLOBALES */}
          {/* ==================== */}
          <Route path="appointments">
            <Route index element={<AppointmentsView />} />
            <Route path="select-patient" element={<SelectPatientForAppointment />} />
          </Route>

          {/* CONSULTAS GLOBALES */}
          <Route path="consultations" element={<AllConsultationsView />} />

          {/* ==================== */}
          {/* EXÁMENES DE LABORATORIO */}
          {/* ==================== */}
          <Route path="lab-exams">
            <Route index element={<LabExamListView />} />
            <Route path="create" element={<CreateLabExamView />} />
            <Route path=":id" element={<LabExamDetailView />} />
          </Route>

          {/* ==================== */}
          {/* PROPIETARIOS (OWNERS) */}
          {/* ==================== */}
          <Route path="owners">
            <Route index element={<OwnerListView />} />
            <Route path="new" element={<CreateOwnerView />} />
            <Route path=":ownerId">
              <Route index element={<OwnerDatailView />} />
              <Route path="edit" element={<EditOwnerView />} />
              <Route path="patients/new" element={<CreatePatientView />} />
            </Route>
          </Route>

          {/* ==================== */}
          {/* PACIENTES (PATIENTS) */}
          {/* ==================== */}
          <Route path="patients">
            <Route index element={<PatientListView />} />
            <Route path=":patientId" element={<PatientLayout />}>
              <Route index element={<PatientDataView />} />
              <Route path="edit" element={<EditPatientView />} />

              {/* Estudios Médicos */}
              <Route path="studies">
                <Route index element={<MedicalStudyListView />} />
                <Route path="create" element={<CreateMedicalStudyView />} />
              </Route>

              {/* Vacunaciones */}
              <Route path="vaccinations">
                <Route index element={<VaccinationListView />} />
                <Route path="create" element={<CreateVaccinationView />} />
              </Route>

              {/* Desparasitaciones */}
              <Route path="dewormings">
                <Route index element={<DewormingListView />} />
                <Route path="create" element={<CreateDewormingView />} />
              </Route>

              {/* Consultas */}
              <Route path="consultations">
                <Route index element={<ConsultationListView />} />
                <Route path="create" element={<CreateConsultationView />} />
              </Route>

              {/* Recetas */}
              <Route path="recipes">
                <Route index element={<RecipeListView />} />
                <Route path="create" element={<CreateRecipeView />} />
              </Route>

              {/* Citas del Paciente */}
              <Route path="appointments/create" element={<CreateAppointmentView />} />
              <Route path="appointments/:appointmentId" element={<AppointmentDetailsView />} />
              <Route path="appointments/:appointmentId/edit" element={<EditAppointmentView />} />

              {/* Exámenes de Laboratorio del Paciente */}
              <Route path="lab-exams">
                <Route index element={<PatientLabExamListView />} />
                <Route path="create" element={<CreateLabExamView />} />
                <Route path=":labExamId/edit" element={<EditLabExamView />} />
                <Route path=":labExamId" element={<LabExamDetailView />} />
              </Route>

              {/* Servicios de Peluquería del Paciente */}
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
          {/* PRODUCTOS */}
          {/* ==================== */}
          <Route path="products">
            <Route index element={<ProductListView />} />
            <Route path="new" element={<CreateProductView />} />
            <Route path=":productId/edit" element={<EditProductView />} />
          </Route>

          {/* ==================== */}
          {/* VENTAS */}
          {/* ==================== */}
          <Route path="sales" element={<CreateSaleView />} />

          {/* ==================== */}
          {/* COMPRAS */}
          {/* ==================== */}
          <Route path="purchases">
            <Route index element={<PurchaseListView />} />
            <Route path="create" element={<CreatePurchaseView />} />
          </Route>

          {/* ==================== */}
          {/* INVENTARIO */}
          {/* ==================== */}
          <Route path="inventory">
            <Route path="stock" element={<InventoryStockView />} />
            <Route path="movements" element={<InventoryMovementsView />} />
            <Route path="low-stock" element={<InventoryLowStockView />} />
          </Route>

          {/* ==================== */}
          {/* REPORTES */}
          {/* ==================== */}
          <Route path="grooming/report" element={<GroomingReportView />} />
          <Route path="invoices">
            <Route path="report" element={<InvoiceReportView />} />
            <Route path=":id" element={<InvoiceDetailView />} />
          </Route>

          {/* ==================== */}
          {/* CONFIGURACIONES */}
          {/* ==================== */}
          <Route path="payment-methods">
            <Route index element={<PaymentMethodsView />} />
            <Route path="new" element={<CreatePaymentMethodView />} />
          </Route>

          <Route path="staff">
            <Route index element={<StaffListView />} />
            <Route path="new" element={<CreateStaffView />} />
            <Route path=":staffId/edit" element={<EditStaffView />} />
          </Route>

          {/* ==================== */}
          {/* RUTAS INDEPENDIENTES */}
          {/* ==================== */}
          <Route path="grooming-services" element={<GroomingServicesView />} />
        </Route>

        {/* ========================================== */}
        {/* RUTA 404 */}
        {/* ========================================== */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Página no encontrada
                </h2>
                <p className="text-gray-600 mb-6">
                  La página que buscas no existe.
                </p>
                <a
                  href="/"
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
                >
                  Volver al inicio
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}