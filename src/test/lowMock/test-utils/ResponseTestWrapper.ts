import { HTTP_CODES } from "../../../app/model/ServerModel";

export class ResponseTestWrapper {
    public statusCode: HTTP_CODES | undefined;
    public body: object | undefined;
    public headers = new Array<object>()

    public writeHead(statusCode: HTTP_CODES, headers: object) {
        this.statusCode = statusCode;
        this.headers.push(headers)
    }
    public write(stringifiedBody: string) {
        this.body = JSON.parse(stringifiedBody)
    }
    public end() { }
    public clearDefaults() {
        this.statusCode = undefined;
        this.body = undefined;
        this.headers.length = 0
    }
}