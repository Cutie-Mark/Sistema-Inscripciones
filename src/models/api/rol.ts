import { request } from "@/models/api/solicitudes";

export async function crearRol(roleName: string) {
    if (!roleName || roleName.length > 30) {
        return "El nombre del rol no puede tener más de 30 caracteres";
    }
    try {
        await request("/api/roles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: roleName }),
        });
    } catch (e) {
        console.error("Error al crear el rol:", e);
    }
}