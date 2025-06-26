"use client";

import VersionesPage from "@/views/admin/VersionesPage";

const Admin = () => {
    return <VersionesPage 
    title="Seleccione una olimpiada para ver mas detalles"
    textoNoHayVersiones="No hay versiones disponibles aún."
    textoBoton="Ver Detalles" />;
};

export default Admin;