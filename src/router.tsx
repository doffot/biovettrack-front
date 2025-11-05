// src/router/Router.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import OwnerListView from "./view/owner/OwnerListView";
import CreateOwnerView from "./view/owner/CreateOwnerView";
import EditOwnerView from "./view/owner/EditOwnerView";
import OwnerDatailView from "./view/owner/OwnerDetailView";
import PatientListView from "./view/patient/PatientListView";
import CreatePatientView from "./view/patient/CreatePatientView";
import PatientDetailView from "./view/patient/PatientDetailView";
import EditPatientView from "./view/patient/EditPatientView";
import CreateLabExamView from "./view/labExams/CreateLabExamView";
import LabExamDetailView from "./view/labExams/LabExamDetailView";
import CreateGroomingServiceView from "./view/grooming/CreateGroomingServiceView";
import GroomingServicesView from "./view/grooming/GroomingServicesView"; 
import AuthLayout from "./layout/AuthLayout";
import HomeView from "./view/home/HomeView";

// ✅ Solo la vista que ya tienes
import CreateAppointmentView from "./view/appointment/CreateAppointmentView";
import LabExamListView from "./view/labExams/labExamListView";
import LoginView from "./view/auth/LoginView";
import RegisterView from "./view/auth/RegisterView";
import ConfirmAccountView from "./view/auth/ConfirmAccountView";
import RequestNewToken from "./view/auth/RequestNewToken";
import ForgotPasswordView from "./view/auth/ForgotPasswordView";
import NewPasswordView from "./view/auth/NewPasswordView";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomeView />} index />

          {/* Rutas de Dueño */}
          <Route path="owners" element={<OwnerListView />} />
          <Route path="owners/new" element={<CreateOwnerView />} />
          <Route path="owners/:ownerId" element={<OwnerDatailView />} />
          <Route path="owners/:ownerId/edit" element={<EditOwnerView />} />

          {/* Rutas de Paciente */}
          <Route path="patients" element={<PatientListView />} />
          <Route path="patients/:patientId" element={<PatientDetailView />} />
          <Route path="owners/:ownerId/patients/new" element={<CreatePatientView />} />
          <Route path="patients/edit/:patientId" element={<EditPatientView />} />

          {/* Rutas de Exámenes de Laboratorio */}
          <Route
            path="patients/:patientId/lab-exams"
            element={<LabExamListView />}
          />
          <Route
            path="patients/:patientId/lab-exams/create"
            element={<CreateLabExamView />}
          />
          <Route
            path="patients/:patientId/lab-exams/:labExamId"
            element={<LabExamDetailView />}
          />

          {/* ========================================== */}
          {/* ✅ RUTA DE CREAR CITA (única que existe) */}
          {/* ========================================== */}
          <Route
            path="patients/:patientId/appointments/create"
            element={<CreateAppointmentView />}
          />

          {/* ========================================== */}
          {/* RUTAS DE GROOMING */}
          {/* ========================================== */}
          <Route
            path="grooming-services"
            element={<GroomingServicesView />}
          />
          <Route
            path="patients/:patientId/grooming-services/create"
            element={<CreateGroomingServiceView />}
          />
          <Route
            path="patients/:patientId/grooming-services"
            element={<GroomingServicesView />}
          />

        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginView />} />
          <Route path="/auth/register" element={<RegisterView />} />
          <Route path="/auth/confirm-account" element={<ConfirmAccountView />} />
          <Route path="/auth/request-new-token" element={<RequestNewToken />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordView />} />
          <Route path="/auth/new-password" element={<NewPasswordView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}