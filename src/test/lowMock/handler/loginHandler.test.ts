import { DataBase } from "../../../app/data/DataBase";
import { Account } from "../../../app/model/AuthModel";
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
const account: Account = {
    id: '',
    password: 'pass',
    userName: 'user'
}
const jsonHeader = { 'Content-Type': 'application/json' }
const token = "1234"
const getBySpy = jest.spyOn(DataBase.prototype, 'getBy')
const insertSpy = jest.spyOn(DataBase.prototype, 'insert')



describe('Login Request handler test', () => {
    beforeEach(() => {
        // @ts-ignore
        requestTestWrapper.headers['user-agent'] = 'jest-test'
    })
    afterEach(() => {
        requestTestWrapper.clearDefaults()
        responseTestWrapper.clearDefaults()
        jest.clearAllMocks()
    })
    test('Should login user with valid username password', async () => {
        requestTestWrapper.method = HTTP_METHODS.POST
        requestTestWrapper.body = account
        requestTestWrapper.url = 'localhost:8080/login'
        getBySpy.mockResolvedValueOnce(account);
        insertSpy.mockResolvedValueOnce(token);
        await new Server().startServer()
        await new Promise(process.nextTick); // this solves timing issues, 
        expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.CREATED)
        expect(responseTestWrapper.body).toEqual({
            token
        })
        expect(responseTestWrapper.headers).toContainEqual(jsonHeader);
    })
    test('Should not login user with wrong username password', async () => {
        requestTestWrapper.method = HTTP_METHODS.POST
        requestTestWrapper.body = account
        requestTestWrapper.url = 'localhost:8080/login'
        getBySpy.mockResolvedValueOnce({});
        await new Server().startServer()
        await new Promise(process.nextTick); // this solves timing issues, 
        expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.NOT_fOUND)
        expect(responseTestWrapper.body).toBe('wrong username or password')
    })
    test('Should return bad request for invalid user', async () => {
        requestTestWrapper.method = HTTP_METHODS.POST
        requestTestWrapper.body = {}
        requestTestWrapper.url = 'localhost:8080/login'
        await new Server().startServer()
        await new Promise(process.nextTick); // this solves timing issues, 
        expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.BAD_REQUEST)
        expect(responseTestWrapper.body).toBe('userName and password required')
        expect(responseTestWrapper.headers).toContainEqual(jsonHeader);
    })
    test('Should return nothing for other methods', async () => {
        requestTestWrapper.method = HTTP_METHODS.DELETE
        requestTestWrapper.body = {}
        requestTestWrapper.url = 'localhost:8080/login'
        await new Server().startServer()
        await new Promise(process.nextTick); // this solves timing issues, 
        expect(responseTestWrapper.statusCode).toBeUndefined()
        expect(responseTestWrapper.body).toBeUndefined()
    })
})