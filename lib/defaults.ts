import {IOptions} from "./IOptions";

export  let Defaults: IOptions = {
    errorStack: false,
    fireRequestEvents:false,
    trustProxy:true,
    errorMessage: true,
    maxRouteCache: 10000,
    useRouteCache: true,
    decodeUrlParams: false,
    urlParser: "fast",
};
