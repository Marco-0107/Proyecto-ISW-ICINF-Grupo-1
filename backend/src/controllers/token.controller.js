"use strict"

import {
   getTokenService,
   getTokensService,
   closeTokenService,
   createTokenService,
} from "../services/token.service.js";

import {
    tokenBodyValidation,
    tokenQueryValidation,
} from "../services/token.validation.js"

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";

// Obtengo Token por id 

export async function getToken(req, res) {
    try {
        const { id_token } = req.query;

        const { error } = tokenQueryValidation.validate({ id_token });
        if (error) return handleErrorClient(res, 400, error.message);

        const [token, errorToken] = await getTokenService ({ id_token });
        if (errorToken) return handleErrorClient(res, 404, errorToken);
        
        handleSuccess(res, 200, "Token encontrado", token);
        
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

// Listo todas los token
 export async function getTokens (req, res) {
    try {
        const [tokens, errorTokens] = await getTokensService();
        if(errorTokens) return handleErrorClient(res, 404, errorTokens)

        tokens.length === 0
        ? handleSuccess(res, 204)
        : handleSuccess(res, 200, "Tokens encontrados", tokens);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Cierro los Tokens
export async function closeTokens(req, res) {
    try{
        const { id_token } = req.query;
        const { body } = req;

        const { error: queryError } = tokenQueryValidation.validate({ id_token });
        if (queryError) return handleErrorClient(res, 400, "Error en consulta", queryError.message);

        const { error: bodyError } = tokenBodyValidation.validate(body);
        if (bodyError) return handleErrorClient(res, 400, "Error en datos", bodyError.message);
        
        const [token, errorCloseToken] = await closeTokenService({ id_token });
        if (errorCloseToken) return handleErrorClient(res, 400, "Error cerrando el Token", errorCloseToken);

        handleSuccess(res, 200, "Token cerrado correctamente", token);
    }catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Creo el Token
export async function createToken(req, res) {
    try{
        const { id, id_reunion } = req.body;

        if (!id || !id_reunion) return handleErrorClient(res, 400, "Faltan datos obligatorios");

        const [token, errorCreateToken] = await createTokenService({ id : id_reunion });
        if (errorReunion) return handleErrorClient(res, 400, "Error creando el Token", errorCreateToken);

        handleSuccess(res, 201, "Token creado correctamente ", token);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
