export interface IOptions{
    port?: number,
    errorStack?: boolean,
    errorMessage?: boolean,
    maxRouteCache?: number,
    useRouteCache?:boolean,
    decodeUrlParams?:boolean,
    qsParser?: "qs" | "querystring"
    urlParser?: "url" | "fast"
    trustProxy?:boolean
    fireRequestEvents?:boolean
    ssl?: {
        key: string
        cert: string
    }
}
