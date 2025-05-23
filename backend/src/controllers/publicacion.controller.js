"use strict"

import {
    createPublicacionService,
    getPublicacionService,
    getPublicacionesService,
    updatePublicacionesService,
    deletePublicacionService,
} from "../services/publicacion.service.js";

import {
    publicacionBodyValidation,
    publicacionQueryValidation,
} from "../services/publicacion.validation.js"

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";
// Obtengo publicacion por id o titulo
export async function getPublicacion(req, res) {
    try {
        const { id_publicacion, titulo } = req.query;

        const { error } = publicacionQueryValidation.validate({ id_publicacion, titulo });
        if (error) return handleErrorClient(res, 400, error.message);

        const [publicacion, errorPub] = await getPublicacionService({ id_publicacion, titulo });
        if (errorPub) return handleErrorClient(res, 404, errorPub);

        handleSuccess(res, 200, "Publicación encontrada", publicacion);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
 }
// Listo todas las publicaciones 
 export async function getPublicaciones (req, res) {
    try {
        const [publicaciones, errorPubs] = await getPublicacionesService();
        if(errorPubs) return handleErrorClient(res, 404, errorPubs)

        publicaciones.length === 0
        ? handleSuccess(res, 204)
        : handleSuccess(res, 200, "Publicaciones encontradas", publicaciones);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Actualizar las publicaciones 
export async function updatePublicacion(req, res) {
    try{
        const { id_publicacion } = req.query;
        const { body } = req;

        const { error: queryError } = publicacionQueryValidation.validate({ id_publicacion });
        if (queryError) return handleErrorClient(res, 400, "Error en consulta", queryError.message);

        const { error: bodyError } = publicacionBodyValidation.validate(body);
        if (bodyError) return handleErrorClient(res, 400, "Error en datos", bodyError.message);
        
        const [publicacion, errorUpdatePub] = await updatePublicacionesService({ id_publicacion }, body);
        if (errorUpdatePub) return handleErrorClient(res, 400, "Error actualizando publicacion", errorUpdatePub);

        handleSuccess(res, 200, "Publicacion actualizada", publicacion);
    }catch (error) {
        handleErrorServer(res, 500, error.message);
    }Delete
}
// Eliminar una públicacion
export async function deletePublicacion(req, res) {
    try{
        const { id_publicacion } = req.query;

        const { error } = publicacionQueryValidation.validate({ id });
        if (error) return handleErrorClient(res, 400, "Errror en consulta", error.message);

        const [publicacion, errorDeletePub] = await deletePublicacionService({ id });
        if (errorDeletePub) return handleErrorClient(res, 400, "Error eliminando la publicación", errorDeletePub);

        handleSuccess(res, 200, "Publicación eliminada", publicacion);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Crear una publicación
export async function createPublicacion(req, res) {
    try{
        const { body } = req;

        const { error } = publicacionBodyValidation.validate(body);
        if (error) return handleErrorClient(res, 400, "Datos invalidos", error.message);

        const [publicacion, errorCreatePub] = await createPublicacionService(body);
        if (errorCreatePub) return handleErrorClient(res, 404, "Error creando publicacion", errorCreatePub);

        handleSuccess(res, 201, "Publicación creada correctamente", publicacion);
    } catch {
        handleErrorServer(res, 500, error.message);
    }
}



    
