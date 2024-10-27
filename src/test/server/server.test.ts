import { Authorizer } from "../../app/auth/Authorizer"
import { ReservationsDataAccess } from "../../app/data/ReservationsDataAccess"
import { LoginHandler } from "../../app/handlers/LoginHandler"
import { RegisterHandler } from "../../app/handlers/RegisterHandler"
import { ReservationsHandler } from "../../app/handlers/ReservationsHandler"
import { HTTP_CODES } from "../../app/model/ServerModel"
import { Server } from "../../app/server/Server"

jest.mock("../../app/auth/Authorizer")
jest.mock("../../app/data/ReservationsDataAccess")
jest.mock("../../app/handlers/LoginHandler")
jest.mock("../../app/handlers/ReservationsHandler")
jest.mock("../../app/handlers/RegisterHandler")

const requestMock = {
    url: '',
    headers: {
        'user-agent': 'jest-test'
    }
}
const responseMock = {
    end: jest.fn(),
    writeHead: jest.fn(),
}
const serverMock = {
    listen: jest.fn(),
    close: jest.fn(),
}
jest.mock('http', () => ({
    createServer: (cb: Function) => {
        cb(requestMock, responseMock);
        return serverMock
    }
}))
describe('Main server system test', () => {
    let sut: Server;
    beforeEach(() => {
        sut = new Server();
        expect(Authorizer).toHaveBeenCalledTimes(1)
        expect(ReservationsDataAccess).toHaveBeenCalledTimes(1)
    })
    afterEach(() => {
        jest.clearAllMocks()
    })
    test('should start server on 8080 port', async () => {
        await sut.startServer()
        expect(serverMock.listen).toHaveBeenCalledWith(8080);
        expect(responseMock.end).toHaveBeenCalled()
    })
    test('should handle register requests', async () => {
        requestMock.url = 'localhost:8080/register'
        const registerHandlerSpy = jest.spyOn(RegisterHandler.prototype, 'handleRequest')
        await sut.startServer()

        expect(registerHandlerSpy).toHaveBeenCalledTimes(1)
        expect(RegisterHandler).toHaveBeenCalledWith(requestMock, responseMock, expect.any(Authorizer));
    })
    test('should handle login requests', async () => {
        requestMock.url = 'localhost:8080/login'
        const loginHandlerSpy = jest.spyOn(LoginHandler.prototype, 'handleRequest')
        await sut.startServer()

        expect(loginHandlerSpy).toHaveBeenCalledTimes(1)
        expect(LoginHandler).toHaveBeenCalledWith(requestMock, responseMock, expect.any(Authorizer));
    })
    test('should handle reservation requests', async () => {
        requestMock.url = 'localhost:8080/reservation'
        const reservationHandlerSpy = jest.spyOn(ReservationsHandler.prototype, 'handleRequest')
        await sut.startServer()

        expect(reservationHandlerSpy).toHaveBeenCalledTimes(1)
        expect(ReservationsHandler).toHaveBeenCalledWith(
            requestMock,
            responseMock,
            expect.any(Authorizer),
            expect.any(ReservationsDataAccess));
    })
    test('should do nothing with wrong route', async () => {
        requestMock.url = 'localhost:8080/someRoute'
        const AuthorizerSpy = jest.spyOn(Authorizer.prototype, 'validateToken')
        await sut.startServer()
        expect(AuthorizerSpy).not.toHaveBeenCalled()
    })
    test('should return error if anything went wrong', async () => {
        requestMock.url = 'localhost:8080/reservation'
        const reservationHandlerSpy = jest.spyOn(ReservationsHandler.prototype, 'handleRequest')
        reservationHandlerSpy.mockRejectedValueOnce(new Error('something went wrong'))
        await sut.startServer()
        expect(responseMock.writeHead).toHaveBeenCalledWith(HTTP_CODES.INTERNAL_SERVER_ERROR,
             JSON.stringify(`Internal server error: Error: something went wrong`))
    })
    test('should stop http server', async () => {
        await sut.startServer()
        await sut.stopServer()
        expect(serverMock.close).toHaveBeenCalledTimes(1)
    })

})