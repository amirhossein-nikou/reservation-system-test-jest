import { IncomingMessage, ServerResponse } from "http";
import { Authorizer } from "../../app/auth/Authorizer";
import { LoginHandler } from "../../app/handlers/LoginHandler";
import { Account } from "../../app/model/AuthModel";
import { HTTP_CODES, HTTP_METHODS } from "../../app/model/ServerModel";
const getRequestBodyMock = jest.fn()
jest.mock("../../app/utils/Utils", () => ({
    getRequestBody: () => getRequestBodyMock()
}))
describe('LoginHandler system test', () => {
    let sut: LoginHandler
    const request = {
        method: 'undefined'
    }
    const responseMoke = {
        statusCode: 0,
        writeHead: jest.fn(),
        write: jest.fn()
    }
    const authorizerMoke = {
        login: jest.fn(),
    }
    const id = '1234'
    const token = 'token1234'
    const account: Account = {
        id: '',
        userName: 'user',
        password: "pass",
    }
    beforeEach(() => {
        sut = new LoginHandler(
            request as any as IncomingMessage,
            responseMoke as any as ServerResponse,
            authorizerMoke as any as Authorizer
        )
    })
    afterEach(() => {
        jest.clearAllMocks()
    })
    test('should accept only post method ', async () => {
        request.method = HTTP_METHODS.GET
        await sut.handleRequest()
        expect(responseMoke.writeHead).not.toHaveBeenCalled();
        expect(responseMoke.write).not.toHaveBeenCalled();
        expect(getRequestBodyMock).not.toHaveBeenCalled();
    })
    test('should login to valid account and generate token', async () => {
        request.method = HTTP_METHODS.POST
        getRequestBodyMock.mockResolvedValueOnce(account);
        authorizerMoke.login.mockResolvedValueOnce(token);
        await sut.handleRequest()
        expect(responseMoke.statusCode).toBe(HTTP_CODES.CREATED);
        expect(responseMoke.writeHead).toHaveBeenCalledWith(
            HTTP_CODES.CREATED,
            { 'Content-Type': 'application/json' }
        );
        expect(responseMoke.write).toHaveBeenCalledWith(
            JSON.stringify({token})
        )
    })
    test('should not login to invalid account', async () => {
        request.method = HTTP_METHODS.POST
        getRequestBodyMock.mockResolvedValueOnce({});
        await sut.handleRequest()
        expect(responseMoke.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
        expect(responseMoke.writeHead).toHaveBeenCalledWith(
            HTTP_CODES.BAD_REQUEST,
            { 'Content-Type': 'application/json' }
        );
        expect(responseMoke.write).toHaveBeenCalledWith(
            JSON.stringify('userName and password required')
        )
    })
    test('should not create token for wrong user pass', async () => {
        request.method = HTTP_METHODS.POST
        getRequestBodyMock.mockResolvedValueOnce(account);
        authorizerMoke.login.mockResolvedValueOnce(undefined);
        await sut.handleRequest()
        expect(responseMoke.statusCode).toBe( HTTP_CODES.NOT_fOUND);
        expect(responseMoke.write).toHaveBeenCalledWith(
            JSON.stringify('wrong username or password')
        )
    })
})