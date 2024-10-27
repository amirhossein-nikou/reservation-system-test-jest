import { Authorizer } from "../../app/auth/Authorizer";
import { RegisterHandler } from "../../app/handlers/RegisterHandler"
import { Account } from "../../app/model/AuthModel"
import { IncomingMessage, ServerResponse } from "http";
import { HTTP_CODES, HTTP_METHODS } from "../../app/model/ServerModel";
const getRequestBodyMock = jest.fn()
jest.mock("../../app/utils/Utils", () => ({
    getRequestBody: () => getRequestBodyMock()
}))
describe('RegisterHandler system test', () => {
    let sut: RegisterHandler
    const request = {
        method: 'undefined'
    }
    const responseMoke = {
        statusCode: 0,
        writeHead: jest.fn(),
        write: jest.fn()
    }
    const authorizerMoke = {
        registerUser: jest.fn(),
    }
    const id = '1234'
    const account: Account = {
        id: '',
        userName: 'user',
        password: "pass",
    }
    beforeEach(() => {
        sut = new RegisterHandler(
            request as any as IncomingMessage,
            responseMoke as any as ServerResponse,
            authorizerMoke as any as Authorizer
        )
    })
    afterEach(() => {
        jest.clearAllMocks()
    })

    test('should register valid account in request ', async () => {
        request.method = HTTP_METHODS.POST
        getRequestBodyMock.mockResolvedValueOnce(account);
        authorizerMoke.registerUser.mockResolvedValueOnce(id);
        await sut.handleRequest()
        expect(responseMoke.statusCode).toBe(HTTP_CODES.CREATED);
        expect(responseMoke.writeHead).toHaveBeenCalledWith(
            HTTP_CODES.CREATED,
            { 'Content-Type': 'application/json' }
        );
        expect(responseMoke.write).toHaveBeenCalledWith(
            JSON.stringify({ userId: id })
        )
    })
    test('should accept only post method ', async () => {
        request.method = HTTP_METHODS.GET
        await sut.handleRequest()
        expect(responseMoke.writeHead).not.toHaveBeenCalled();
        expect(responseMoke.write).not.toHaveBeenCalled();
        expect(getRequestBodyMock).not.toHaveBeenCalled();
    })

    test('should not register invalid account in request ', async () => {
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
})