import { useState } from "react";
import { updateReunion } from "@services/reunion.service";

export default function useUpdateReunion() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const editarReunion = async (id_reunion, data, onSuccess) => {
    try {
      setLoading(true);
      await updateReunion(id_reunion, data);
      setLoading(false);

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
      setError("Error al editar la reunión.");
      setLoading(false);
      throw err;
    }
  };

  return {
    editarReunion,
    loading,
    error,
  };
}
