import { useState } from "react";
import { deleteMovimiento } from "../../services/movimiento.service";
import { deleteDataAlert, showErrorAlert, showSuccessAlert } from "../../helpers/sweetAlert";

export default function useDeleteMovimiento() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const eliminarMovimiento = async (id, onSuccess) => {
        try {
            const result = await deleteDataAlert();
            if (result.isConfirmed) {
                setLoading(true);
                await deleteMovimiento(id);
                setLoading(false);

                showSuccessAlert('Exito', 'Se eliminó el movimiento.');

                if (onSuccess) {
                    setTimeout(() => {
                        onSuccess();
                    }, 100);
                }
            }
        } catch (error) {
            console.error("Error al eliminar el movimiento:", error);
            setError("Error al eliminar el movimiento");
            setLoading(false);
            showErrorAlert('Error', 'No se pudo eliminar el movimiento.');
        }
    };
    return {
        eliminarMovimiento,
        loading,
        error,
    };

}