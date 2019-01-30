export interface IOptions{
    port?: number,
    errorStack?: boolean,
    errorMessage?: boolean,
    maxRouteCache?: number,
    useRouteCache?:boolean,
    decodeUrlParams?:boolean,
    qsParser?: "qs" | "querystring"
    urlParser?: "url" | "fast"
    viewEngine?: (path: string, options?: { cache?: boolean, [otherOptions: string]: any }) => Promise<string>;
    viewFolder?: string
    viewCache?: boolean
    viewExt?: string
    trustProxy?:boolean
    fireRequestEvents?:boolean
    ssl?: {
        key: string
        cert: string
    }
}