export interface FinalErrorRes {

    statusCode: number
    error: string
    message: string | undefined
    path: string
    timestamp: string
    requestId: string

}