export class Util {

    public static parseUrlFast(str: string): { pathname: string, query: string } {
        let index = str.indexOf('?');
        if (index > -1) {
            let pathname = str.substring(0, index);
            let query = str.substring(index + 1);

            return {query, pathname}
        } else {
            return {pathname: str, query: ""}
        }
    }


}

