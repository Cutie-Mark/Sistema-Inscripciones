import { useState } from "react";
import { toast } from "sonner";
import { crearRol } from "@/models/api/rol";
export function useCrearRol() {
  const [open, setOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [error, setError] = useState("");

  const handleRoleNameChange = (value: string) => {
    setRoleName(value);
    if (value.length > 30) {
      setError("El nombre del rol no puede tener más de 30 caracteres");
    } else {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setError("El nombre del rol es obligatorio");
      return;
    }
    try {
      await crearRol(roleName);
      setRoleName("");
      toast.success("Rol creado exitosamente");
      setOpen(false);
      setRoleName("");
      setError("");
    } catch (e) {
      toast.error("Error al crear el rol");
      console.error("Error al crear el rol:", e);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setRoleName("");
    setError("");
  };

  return {
    open,
    setOpen,
    roleName,
    error,
    handleSubmit,
    handleRoleNameChange,
    handleClose,
  };
}
