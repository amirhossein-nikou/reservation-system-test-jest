import { DataBase } from "../../../app/data/DataBase";
import { HTTP_CODES, HTTP_METHODS } from "../../../app/model/ServerModel";
import { Server } from "../../../app/server/Server";
import { RequestTestWrapper } from "../test-utils/RequestTestWrapper";
import { ResponseTestWrapper } from "../test-utils/ResponseTestWrapper";

jest.mock("../../../app/data/DataBase")
const requestTestWrapper = new RequestTestWrapper()
const responseTestWrapper = new ResponseTestWrapper()
const fakeServer = {
    listen: () => { },
    close: () => { }
}
jest.mock('http', () => ({
    createServer: (cb: Function) => {
        cb(requestTestWrapper, responseTestWrapper);
        return fakeServer
    }
}))
describe('Register handler system test with low mock', () => {
    afterEach(() => {
        requestTestWrapper.clearDefaults()
        responseTestWrapper.clearDefaults()

    })
    test('should register new User', async () => {
        requestTestWrapper.method = HTTP_METHODS.POST
        requestTestWrapper.body = {
            userName: 'user',
            password: 'pass'
        }
        requestTestWrapper.url = 'localhost:8080/register'
        jest.spyOn(DataBase.prototype, 'insert').mockResolvedValueOnce('1234')
        await new Server().startServer()
        await new Promise(process.nextTick) // solve timing issues
        expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.CREATED);
        expect(responseTestWrapper.body).toEqual(expect.objectContaining({
            userId: expect.any(String) // it should be 1234
        }))
    })
    test('should return bad request for invalid username password', async () => {
        requestTestWrapper.method = HTTP_METHODS.POST
        requestTestWrapper.body = {};
        requestTestWrapper.url = 'localhost:8080/register'
        await new Server().startServer()
        await new Promise(process.nextTick) // solve timing issues
        expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
        expect(responseTestWrapper.body).toBe('userName and password required')
    })
    test('should return nothing when method is not POST', async () => {
        requestTestWrapper.method = HTTP_METHODS.DELETE
        requestTestWrapper.body = {};
        requestTestWrapper.url = 'localhost:8080/register'
        await new Server().startServer()
        await new Promise(process.nextTick) // solve timing issues
        expect(responseTestWrapper.statusCode).toBeUndefined()
        expect(responseTestWrapper.body).toBeUndefined()
    })
})