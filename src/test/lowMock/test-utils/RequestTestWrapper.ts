import { HTTP_METHODS } from "../../../app/model/ServerModel";

export class RequestTestWrapper {
    public method: HTTP_METHODS | undefined;
    public url: string | undefined;
    public body: object | undefined;
    public headers = {}

    public on(event: string,cb:Function){
        if(event == 'data'){
            cb(JSON.stringify(this.body))
        }else cb()
    }
    public clearDefaults(){
        this.method = undefined
        this.url= undefined
        this.body = undefined
        this.headers = {}
    }
}