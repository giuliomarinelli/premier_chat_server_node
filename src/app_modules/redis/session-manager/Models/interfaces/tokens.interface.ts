import { UUID } from "crypto"

export interface ISessionTokens {
    
    accessTokenJti?: UUID // ID del token di accesso
    refreshTokenJti?: UUID // ID del token di aggiornamento
    wsAccessTokenJti?: UUID // ID del token di accesso per WebSocket
    wsRefreshTokenJti?: UUID // ID del token di aggiornamento per WebSocket
    
}