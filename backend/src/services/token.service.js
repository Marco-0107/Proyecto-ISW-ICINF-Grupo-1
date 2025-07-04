import Token from "../entity/token.entity.js";
import { AppDataSource } from "../config/configDb.js";

// Obtener un Token por ID
export async function getTokenService({ id_token }) {
    try {
        const tokenRepository = AppDataSource.getRepository(Token);

        const tokenFound = await tokenRepository.findOne({
        where: { id_token: id_token },
        });

        if (!tokenFound) return [null, "Token no encontrado"];

        return [tokenFound, null];

    } catch (error) {
        console.error("Error al obtener el token", error);
        return [null, "Error interno del servidor"];
  }
}
// Obtengo los tokens por ID
export async function getTokensService() {
    try {
        const tokenRepository = AppDataSource.getRepository(Token);

        const tokens = await tokenRepository.find();

        if (!tokens || tokens.length === 0) return [null, "No hay Tokens"];

        return [tokens, null];

    } catch (error) {
        console.error("Error al obtener los Tokens:", error);
        return [null, "Error interno del servidor"];
    }
}
// Cerrar un Token
export async function closeTokenService({id_token}) {
    try {
        const tokenRepository = AppDataSource.getRepository(Token);

        const tokenFound = await tokenRepository.findOne({
        where: { id_token : id_token }
        });

        if (!tokenFound) return [null, "Token no encontrado"];
        
        if(tokenFound.estado === "cerrado") return [null, "El token ya esta cerrado"];

        tokenFound.estado = "cerrado";
        const cerrado = await tokenRepository.save(tokenFound);

        return [cerrado, null];
    } catch (error){
        console.error("Error al actualizar la reunión:", error);
        return [null, "Error interno del servidor"];
    }
}
// Crear Token
export async function createTokenService({id, id_reunion}) {
    try{
        const tokenRepository = AppDataSource.getRepository(Token);

        const tokenExistente = await tokenRepository.findOne({
            where: {
            id_reunion,
            estado: "activo",
            }
        });

        if (tokenExistente) return [null, "Ya existe un token activo para esta reunión"]

        const newToken = tokenRepository.create ({
            numero_token: generarTokenCuatroDigitos(),
            fecha_generacion: new Date(),
            estado: "activo",
            id,
            id_reunion,
        });

        const guardado = await tokenRepository.save(newToken);

        return [guardado, null];
    } catch(error) {
        console.error("Error al crear token:", error);
        return [null, "Error interno del servidor:"];
    }
}

// Generar token de 4 digitos

function generarTokenCuatroDigitos() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}