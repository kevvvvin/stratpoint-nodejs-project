export interface Config {
    port: number,
    mongoURI: string,
    jwtSecret: string,
    logLevel: string,
    nodeENV: string
}