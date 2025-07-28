import { useState } from "react";
import { deletePublicacion } from "@services/publicaciones.service";
import { deleteDataAlert, showSuccessAlert, showErrorAlert } from "@helpers/sweetAlert.js";

export default function useDeletePublicacion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const eliminarPublicacion = async (id_publicacion, onSuccess) => {
    try {
      const result = await deleteDataAlert();
      if (result.isConfirmed) {
        setLoading(true);
        await deletePublicacion(id_publicacion);
        setLoading(false);

        showSuccessAlert("¡Eliminado!", "La publicación ha sido eliminada correctamente.");

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
      console.error("Error al eliminar publicación:", err);
      setError("Error al eliminar la publicación.");
      setLoading(false);
      showErrorAlert("Error", "Ocurrió un error al eliminar la publicación.");
    }
  };

  return {
    eliminarPublicacion,
    loading,
    error,
  };
}
