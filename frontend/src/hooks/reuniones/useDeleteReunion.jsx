import { useState } from "react";
import { deleteReunion } from "@services/reunion.service";

export default function useDeleteReunion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const eliminarReunion = async (id, onSuccess) => {
    const confirmado = window.confirm("¿Estás seguro de eliminar esta reunión?");
    if (!confirmado) return;

    try {
      setLoading(true);
      await deleteReunion(id);
      setLoading(false);

      alert("Reunión eliminada correctamente");

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
      console.error("Error al eliminar reunión:", err);
      setError("Error al eliminar la reunión.");
      setLoading(false);
    }
  };

  return {
    eliminarReunion,
    loading,
    error,
  };
}
