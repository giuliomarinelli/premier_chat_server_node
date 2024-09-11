export interface ISessionTokens {
    
    accessTokenJti?: string // ID del token di accesso
    refreshTokenJti?: string // ID del token di aggiornamento
    wsAccessTokenJti?: string // ID del token di accesso per WebSocket
    wsRefreshTokenJti?: string // ID del token di aggiornamento per WebSocket
    
}