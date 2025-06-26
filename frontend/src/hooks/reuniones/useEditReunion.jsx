import { useState } from "react";
import { updateReunion } from "@services/reunion.service";

export default function useUpdateReunion() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const editarReunion = async (id_reunion, data, onSuccess) => {
    const confirmado = window.confirm("¿Estás seguro de guardar los cambios?");
    if (!confirmado) return;

    try {
      setLoading(true);
      await updateReunion(id_reunion, data);
      setLoading(false);

      alert("Reunión actualizada correctamente");

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          if (typeof window !== "undefined") {
            setTimeout(() => {
              window.location.reload();
            }, 100);
          }
        }, 100);
      }

    } catch (err) {
      console.error("Error al editar reunión:", err);
      setError("Error al editar la reunión.");
      setLoading(false);
    }
  };

  return {
    editarReunion,
    loading,
    error,
  };
}
