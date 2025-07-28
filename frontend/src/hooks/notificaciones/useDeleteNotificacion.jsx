import { useState } from "react";
import { deleteNotificacion } from "@services/notificaciones.service";
import { deleteDataAlert, showSuccessAlert, showErrorAlert } from "@helpers/sweetAlert.js";

export default function useDeleteNotificacion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const eliminarNotificacion = async (id_notificacion, onSuccess) => {
    try {
      const result = await deleteDataAlert();
      if (result.isConfirmed) {
        setLoading(true);
        await deleteNotificacion(id_notificacion);
        setLoading(false);

        showSuccessAlert("¡Eliminado!", "La notificación ha sido eliminada correctamente.");

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
      }
    } catch (err) {
      console.error("Error al eliminar notificación:", err);
      setError("Error al eliminar la notificación.");
      setLoading(false);
      showErrorAlert("Error", "Ocurrió un error al eliminar la notificación.");
    }
  };

  return {
    eliminarNotificacion,
    loading,
    error,
  };
}
