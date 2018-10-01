import {IOptions} from "./IOptions";

export  let Defaults: IOptions = {
    errorStack: false,
    errorMessage: true,
    maxRouteCache: 10000,
    useRouteCache: true,
    decodeUrlParams: false,
    qsParser: "qs",
    urlParser: "fast",
    viewExt: "html",
    viewCache: true,
    viewEngine: null,
    viewFolder: ""
};