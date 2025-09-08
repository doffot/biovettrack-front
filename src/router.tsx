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
// Import the new EditPatientView component
import EditPatientView from "./view/patient/EditPatientView";

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
          {/*
          <Route path="owners/:ownerId/pets/new" element={<CreatePatientView />} />
          */}

          {/* Rutas de Paciente */}
          <Route path="patients" element={<PatientListView />} />
          <Route path="patients/:patientId" element={<PatientDetailView />} />

          {/* New Route to Create a Patient for an Owner */}
          <Route path="owners/:ownerId/patients/new" element={<CreatePatientView />} />

          {/* New Route to Edit a Patient */}
          <Route path="patients/edit/:patientId" element={<EditPatientView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}