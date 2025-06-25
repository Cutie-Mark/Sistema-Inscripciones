"use client";
import { Olimpiada } from "@/models/interfaces/versiones";
import VersionesPage from "@/views/admin/VersionesPage";

const validPhases: string[] = [
  "Primera inscripción",
  "Segunda inscripción",
  "Tercera inscripción",
  "Cuarta inscripción",
  "Primera clasificación",
  "Segunda clasificación",
  "Tercera clasificación",
  "Final",
  "Segunda Final",
  "Premiación",
  "Segunda premiación",
];

const AdminReportesPage = () => (
  <VersionesPage
    title="Seleccione una olimpiada para Generar el Reporte deseado"
    textoNoHayVersiones="No hay versiones que estén mínimamente en fase de inscripción o no hay versiones disponibles aún."
    textoBoton="Ver Reporte"
    filter={(olimpiada: Olimpiada) => {
      const today = new Date();

      const olympiadEnd = olimpiada.fecha_fin
        ? new Date(olimpiada.fecha_fin)
        : null;
        
      const phaseName = olimpiada.fase?.fase?.nombre_fase ?? "";

      const hasOlympiadEnded =
        olympiadEnd !== null && today.getTime() > olympiadEnd.getTime();
      const isInValidPhase = validPhases.includes(phaseName);

      return hasOlympiadEnded || isInValidPhase;
    }}
  />
);

export default AdminReportesPage;
