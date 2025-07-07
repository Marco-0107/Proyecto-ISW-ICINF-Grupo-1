import { useState } from "react";
import { updateNotificacion } from "../../services/notificaciones.service";

export default function useUpdateNotificacion() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const editarNotificacion = async (id_notificacion, data, onSuccess) => {
    const confirmado = window.confirm("¿Estás seguro de guardar los cambios?");
    if (!confirmado) return;

    try {
      setLoading(true);
      await updatePublicacion(id_notificacion, data);
      setLoading(false);

      alert("Notificacón actualizada correctamente");

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
      console.error("Error al editar notificación:", err);
      setError("Error al editar la notificación.");
      setLoading(false);
    }
  };

  return {
    editarNotificacion,
    loading,
    error,
  };
}
