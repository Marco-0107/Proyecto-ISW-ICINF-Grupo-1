import { useState } from "react";
import { updatePublicacion } from "../../services/publicaciones.service";

export default function useUpdatePublicacion() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const editarPublicacion = async (id_publicacion, data, onSuccess) => {
    const confirmado = window.confirm("¿Estás seguro de guardar los cambios?");
    if (!confirmado) return;

    try {
      setLoading(true);
      await updatePublicacion(id_publicacion, data);
      setLoading(false);

      alert("Publicación actualizada correctamente");

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
      console.error("Error al editar publicación:", err);
      setError("Error al editar la publicación.");
      setLoading(false);
    }
  };

  return {
    editarPublicacion,
    loading,
    error,
  };
}
