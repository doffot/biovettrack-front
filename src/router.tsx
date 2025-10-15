import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import OwnerListView from "./view/owner/OwnerListView";
import CreateOwnerView from "./view/owner/CreateOwnerView";
import EditOwnerView from "./view/owner/EditOwnerView";
import OwnerDatailView from "./view/owner/OwnerDetailView";
import MainMenu from "./components/MainMenu";
import PatientListView from "./view/patient/PatientListView";
import CreatePatientView from "./view/patient/CreatePatientView";
import PatientDetailView from "./view/patient/PatientDetailView";
import EditPatientView from "./view/patient/EditPatientView";
import CreateLabExamView from "./view/labExams/CreateLabExamView";
import LabExamDetailView from "./view/labExams/LabExamDetailView";
import LabExamListView from "./view/labExams/labExamListView";
import CreateGroomingServiceView from "./view/grooming/CreateGroomingServiceView";
import GroomingServicesView from "./view/grooming/GroomingServicesView"; // ⭐ IMPORTAR LA NUEVA VISTA

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<MainMenu />} index />

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
      </Routes>
    </BrowserRouter>
  );
}