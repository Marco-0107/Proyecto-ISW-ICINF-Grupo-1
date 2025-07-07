import { useState } from "react";
import { deletePublicacion } from "@services/publicaciones.service";

export default function useDeletePublicacion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const eliminarReunion = async (id_publicacion, onSuccess) => {
    const confirmado = window.confirm("¿Estás seguro de eliminar esta publicación?");
    if (!confirmado) return;

    try {
      setLoading(true);
      await deletePublicacion(id_publicacion);
      setLoading(false);

      alert("Publiacación eliminada correctamente");

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
      console.error("Error al eliminar publicación:", err);
      setError("Error al eliminar la publicación.");
      setLoading(false);
    }
  };

  return {
    eliminarPublicacion,
    loading,
    error,
  };
}
