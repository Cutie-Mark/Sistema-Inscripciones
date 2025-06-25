"use client";

import VersionesPage from "@/views/admin/VersionesPage";

const Admin = () => {
    return <VersionesPage 
    title="Seleccione una olimpiada para definir Fases"
    textoNoHayVersiones="No hay versiones disponibles aún."
    textoBoton="Definir Fases" />;
};

export default Admin; 