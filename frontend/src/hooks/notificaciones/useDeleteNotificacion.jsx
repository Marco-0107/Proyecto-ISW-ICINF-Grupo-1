import { useState } from "react";
import { deleteNotificacion } from "@services/notificaciones.service";

export default function useDeleteNotificacion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const eliminarNotificacion = async (id_notificacion, onSuccess) => {
    const confirmado = window.confirm("¿Estás seguro de eliminar esta notificación?");
    if (!confirmado) return;

    try {
      setLoading(true);
      await deleteNotificacion(id_notificacion);
      setLoading(false);

      alert("Notificación eliminada correctamente");

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
      console.error("Error al eliminar notificación:", err);
      setError("Error al eliminar la notificación.");
      setLoading(false);
    }
  };

  return {
    eliminarNotificacion,
    loading,
    error,
  };
}
