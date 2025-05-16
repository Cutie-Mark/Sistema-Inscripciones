"use client";

import VersionesPage from "@/pages/admin/VersionesPage";

const Admin = () => {
    return (
        <VersionesPage
            filter={({ fase }) =>
                fase && fase?.fase?.nombre_fase === "Preparación"
            }
            title="Seleccione una olimpiada para asociar Areas"
        />
    );
};

export default Admin;
