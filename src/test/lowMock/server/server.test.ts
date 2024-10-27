import { ReservationsHandler } from "../../../app/handlers/ReservationsHandler"
import { HTTP_CODES } from "../../../app/model/ServerModel"
import { Server } from "../../../app/server/Server"
import { RequestTestWrapper } from "../test-utils/RequestTestWrapper"
import { ResponseTestWrapper } from "../test-utils/ResponseTestWrapper"

const requestTestWrapper = new RequestTestWrapper()
const responseTestWrapper = new ResponseTestWrapper()
const fakeServer = {
    listen: () => { },
    close: jest.fn()
}
jest.mock('http', () => ({
    createServer: (cb: Function) => {
        cb(requestTestWrapper, responseTestWrapper);
        return fakeServer
    }
}))
describe('server tests =>', () => {

    test('should return nothing with wrong route', async () => {
        requestTestWrapper.url = 'localhost:8080/some/'
        await new Server().startServer()
        await new Promise(process.nextTick); // this solves timing issues
        expect(responseTestWrapper.body).toBeUndefined();
        expect(responseTestWrapper.statusCode).toBeUndefined()
        expect(responseTestWrapper.headers).toHaveLength(0)
    })
    test('should stop server', async () => {
        const server = new Server()
        await server.startServer()
        await server.stopServer()
        await new Promise(process.nextTick); // this solves timing issues
        expect(fakeServer.close).toHaveBeenCalled()
    })
    test('should return internal server error if something went wrong', async () => {
        requestTestWrapper.url = 'localhost:8080/reservation/'
        const reservationHandlerSpy = jest.spyOn(ReservationsHandler.prototype, 'handleRequest')
        reservationHandlerSpy.mockRejectedValueOnce(new Error('something went wrong'))
        await new Server().startServer()
        await new Promise(process.nextTick); // this solves timing issues
        expect(responseTestWrapper.body).toBeUndefined();
        expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.INTERNAL_SERVER_ERROR)
        expect(responseTestWrapper.headers).toContainEqual(JSON.stringify(`Internal server error: Error: something went wrong`));
    })
})