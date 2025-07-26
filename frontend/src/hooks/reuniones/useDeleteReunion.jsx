import { useState } from "react";
import { deleteReunion } from "@services/reunion.service";

export default function useDeleteReunion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const eliminarReunion = async (id, onSuccess) => {
    try {
      setLoading(true);
      await deleteReunion(id);
      setLoading(false);

      if (onSuccess) {
        onSuccess();
      }

    } catch (err) {
      setError("Error al eliminar la reunión.");
      setLoading(false);
      throw err;
    }
  };

  return {
    eliminarReunion,
    loading,
    error,
  };
}
