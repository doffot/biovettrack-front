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
import LabExamListView from "./view/labExams/labExamListView";
import CreateGroomingServiceView from "./view/grooming/CreateGroomingServiceView";
import GroomingServicesView from "./view/grooming/GroomingServicesView"; 
import AuthLayout from "./layout/AuthLayout";
import LoginView from "./view/aurth/LoginView";
import RegisterView from "./view/aurth/RegisterView";
import ConfirmAccountView from "./view/aurth/ConfirmAccountView";
import RequestNewToken from "./view/aurth/RequestNewToken";
import ForgotPasswordView from "./view/aurth/ForgotPasswordView";
import NewPasswordView from "./view/aurth/NewPasswordView";
import HomeView from "./view/home/HomeView";

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

          {/* New Route to Create a Patient for an Owner */}
          <Route
            path="owners/:ownerId/patients/new"
            element={<CreatePatientView />}
          />

          {/* New Route to Edit a Patient */}
          <Route
            path="patients/edit/:patientId"
            element={<EditPatientView />}
          />

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
          {/* ✅ RUTAS DE SERVICIOS DE GROOMING */}
          {/* ========================================== */}
          
          {/* Vista principal: Lista de todos los servicios con filtros */}
          <Route
            path="grooming-services" // ⭐ Ruta principal
            element={<GroomingServicesView />}
          />

          {/* Crear servicio de grooming para un paciente */}
          <Route
            path="patients/:patientId/grooming-services/create"
            element={<CreateGroomingServiceView />}
          />

          {/* Lista de servicios de grooming de un paciente específico */}
          <Route
            path="patients/:patientId/grooming-services"
            element={<GroomingServicesView />} // ⭐ Reutiliza la misma vista (filtra por patientId)
          />

          {/* Detalle de un servicio específico (opcional - para futuro) */}
          {/* <Route
            path="grooming-services/:groomingId"
            element={<GroomingServiceDetailView />}
          /> */}

          {/* Editar servicio de grooming (opcional - para futuro) */}
          {/* <Route
            path="grooming-services/:groomingId/edit"
            element={<EditGroomingServiceView />}
          /> */}
          
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