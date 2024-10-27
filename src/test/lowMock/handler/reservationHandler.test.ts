import { DataBase } from "../../../app/data/DataBase";
import { ReservationsHandler } from "../../../app/handlers/ReservationsHandler";
import { Reservation } from "../../../app/model/ReservationModel";
import { HTTP_CODES, HTTP_METHODS } from "../../../app/model/ServerModel";
import { Server } from "../../../app/server/Server";
import { getRequestBody } from "../../../app/utils/Utils";
import { RequestTestWrapper } from "../test-utils/RequestTestWrapper";
import { ResponseTestWrapper } from "../test-utils/ResponseTestWrapper";

jest.mock("../../../app/data/DataBase")
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
const reservation: Reservation = {
    id: '',
    endDate: 'end',
    room: 'room',
    startDate: 'start',
    user: 'username'
}
const jsonHeader = { 'Content-Type': 'application/json' }
const token = "TOKEN1234"
const id = "1234"
const insertSpy = jest.spyOn(DataBase.prototype, 'insert');
const getBySpy = jest.spyOn(DataBase.prototype, 'getBy');
const getAllElementsSpy = jest.spyOn(DataBase.prototype, 'getAllElements');
const updateSpy = jest.spyOn(DataBase.prototype, 'update');
const deleteSpy = jest.spyOn(DataBase.prototype, 'delete');
describe('reservation requests handler test ', () => {
    beforeEach(() => {
        console.log('before tests');
        // @ts-ignore
        requestTestWrapper.headers['user-agent'] = 'jest-test'
        // @ts-ignore
        requestTestWrapper.headers['authorization'] = token
        getBySpy.mockResolvedValueOnce({
            valid: true
        })
    })
    afterEach(() => {
        console.log('after tests');
        requestTestWrapper.clearDefaults()
        responseTestWrapper.clearDefaults()
        jest.clearAllMocks()
    })
    describe('POST request tests=> ', () => {
        test('should create new reservation', async () => {
            requestTestWrapper.method = HTTP_METHODS.POST

            requestTestWrapper.body = reservation
            requestTestWrapper.url = 'localhost:8080/reservation'
            insertSpy.mockResolvedValueOnce(token);
            await new Server().startServer()
            await new Promise(process.nextTick); // this solves timing issues, 
            expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.CREATED)
            expect(responseTestWrapper.body).toEqual({
                reservationId: token
            })
            expect(responseTestWrapper.headers).toContainEqual(jsonHeader);
        })
        test('should return bad request for invalid reservation', async () => {
            requestTestWrapper.method = HTTP_METHODS.POST
            requestTestWrapper.body = {}
            requestTestWrapper.url = 'localhost:8080/reservation'
            await new Server().startServer()
            await new Promise(process.nextTick); // this solves timing issues, 
            expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.BAD_REQUEST)
            expect(responseTestWrapper.body).toBe('Incomplete reservation!')
        })
        test('should return bad request for invalid reservation -wrong keys-', async () => {
            requestTestWrapper.method = HTTP_METHODS.POST
            requestTestWrapper.body = { some: 'some' }
            requestTestWrapper.url = 'localhost:8080/reservation'
            await new Server().startServer()
            await new Promise(process.nextTick); // this solves timing issues, 
            expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.BAD_REQUEST)
            expect(responseTestWrapper.body).toBe('Incomplete reservation!')
        })
    })
    describe('GET request tests=> ', () => {
        test('should get all reservation', async () => {
            requestTestWrapper.method = HTTP_METHODS.GET

            requestTestWrapper.url = 'localhost:8080/reservation/all'
            getAllElementsSpy.mockResolvedValueOnce([reservation]);
            await new Server().startServer()
            await new Promise(process.nextTick); // this solves timing issues, 
            expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.OK)
            expect(responseTestWrapper.body).toEqual([reservation])
            expect(responseTestWrapper.headers).toContainEqual(jsonHeader);
        })
        test('should return reservation by id', async () => {
            requestTestWrapper.method = HTTP_METHODS.GET

            requestTestWrapper.url = `localhost:8080/reservation/${id}`
            getBySpy.mockResolvedValueOnce(reservation)
            await new Server().startServer()
            await new Promise(process.nextTick); // this solves timing issues, 
            expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.OK)
            expect(responseTestWrapper.body).toEqual(reservation)
            expect(responseTestWrapper.headers).toContainEqual(jsonHeader);
        })
        test('should return not found for invalid id', async () => {
            requestTestWrapper.method = HTTP_METHODS.GET

            requestTestWrapper.url = `localhost:8080/reservation/${id}`
            getBySpy.mockResolvedValueOnce(undefined)
            await new Server().startServer()
            await new Promise(process.nextTick); // this solves timing issues, 
            expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.NOT_fOUND)
            expect(responseTestWrapper.body).toEqual(`Reservation with id ${id} not found`)
        })
        test('should return bad request for invalid route', async () => {
            requestTestWrapper.method = HTTP_METHODS.GET

            requestTestWrapper.url = `localhost:8080/reservation/`
            await new Server().startServer()
            await new Promise(process.nextTick); // this solves timing issues, 
            expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.BAD_REQUEST)
            expect(responseTestWrapper.body).toEqual('Please provide an ID!')
        })

    })
    describe('PUT request tests=> ', () => {
        test('should update reservation', async () => {
            requestTestWrapper.method = HTTP_METHODS.PUT

            const updateFiled = {
                endDate: 'endDate',
                startDate: 'start'
            }
            getBySpy.mockResolvedValueOnce(reservation);
            requestTestWrapper.body = updateFiled
            requestTestWrapper.url = `localhost:8080/reservation/${id}`
            await new Server().startServer()
            await new Promise(process.nextTick); // this solves timing issues, 
            expect(updateSpy).toHaveBeenCalledTimes(2)
            expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.OK)
            expect(responseTestWrapper.body).toEqual(`Updated ${Object.keys(updateFiled)} of reservation ${id}`)
        })
        test('should not update reservation with invalid filed -has no keys-', async () => {
            requestTestWrapper.method = HTTP_METHODS.PUT
            const updateFiled = {}
            getBySpy.mockResolvedValueOnce(reservation);
            requestTestWrapper.body = updateFiled
            requestTestWrapper.url = `localhost:8080/reservation/${id}`
            await new Server().startServer()
            await new Promise(process.nextTick); // this solves timing issues, 
            expect(updateSpy).not.toHaveBeenCalled;
            expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.BAD_REQUEST)
            expect(responseTestWrapper.body).toEqual('Please provide valid fields to update!')
        })
        test('should not update reservation with invalid filed -has wrong keys-', async () => {
            requestTestWrapper.method = HTTP_METHODS.PUT
            const updateFiled = { some: 'some' }
            getBySpy.mockResolvedValueOnce(reservation);
            requestTestWrapper.body = updateFiled
            requestTestWrapper.url = `localhost:8080/reservation/${id}`
            await new Server().startServer()
            await new Promise(process.nextTick); // this solves timing issues, 
            expect(updateSpy).not.toHaveBeenCalled;
            expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.BAD_REQUEST)
            expect(responseTestWrapper.body).toEqual('Please provide valid fields to update!')
        })
        test('should return notfound for undefine reservation id', async () => {
            requestTestWrapper.method = HTTP_METHODS.PUT

            requestTestWrapper.url = `localhost:8080/reservation/${id}`
            getBySpy.mockResolvedValueOnce(undefined);
            await new Server().startServer()
            await new Promise(process.nextTick); // this solves timing issues, 
            expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.NOT_fOUND)
            expect(responseTestWrapper.body).toEqual(`Reservation with id ${id} not found`)
        })
        test('should return bad request for wrong route', async () => {
            requestTestWrapper.method = HTTP_METHODS.PUT

            requestTestWrapper.url = `localhost:8080/reservation/`
            await new Server().startServer()
            await new Promise(process.nextTick); // this solves timing issues, 
            expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.BAD_REQUEST)
            expect(responseTestWrapper.body).toEqual('Please provide an ID!')
        })
    })
    describe('DELETE request tests=> ', () => {
        test('should delete reservation for valid id', async () => {
            requestTestWrapper.method = HTTP_METHODS.DELETE
            requestTestWrapper.url = `localhost:8080/reservation/${id}`
            await new Server().startServer()
            await new Promise(process.nextTick); // this solves timing issues, 
            expect(deleteSpy).toHaveBeenCalledTimes(1);
            expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.OK)
            expect(responseTestWrapper.body).toEqual(`Deleted reservation with id ${id}`)
        })
        test('should return bad request if no reservation id is provided', async () => {
            requestTestWrapper.method = HTTP_METHODS.DELETE;
            requestTestWrapper.url = `localhost:8080/reservation/`;
            await new Server().startServer();
            await new Promise(process.nextTick); // this solves timing issues, 
            expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
            expect(responseTestWrapper.body).toBe('Please provide an ID!')
        });
    });

    test('should do nothing for not supported methods', async () => {
        requestTestWrapper.method = HTTP_METHODS.OPTIONS;
        requestTestWrapper.body = {};
        requestTestWrapper.url = 'localhost:8080/reservation';
        await new Server().startServer();
        await new Promise(process.nextTick); // this solves timing issues, 
        expect(responseTestWrapper.statusCode).toBeUndefined();
        expect(responseTestWrapper.body).toBeUndefined();
        expect(responseTestWrapper.headers).toHaveLength(0);
    });

    it('should return not authorized if request is not authorized', async () => {
        requestTestWrapper.method = HTTP_METHODS.POST;
        requestTestWrapper.body = {};
        // @ts-ignore
        requestTestWrapper.headers['authorization'] = undefined
        requestTestWrapper.url = 'localhost:8080/reservation';
        getBySpy.mockReset();
        getBySpy.mockResolvedValueOnce(undefined);
        await new Server().startServer();
        await new Promise(process.nextTick); // this solves timing issues, 
        expect(responseTestWrapper.statusCode).toBe(HTTP_CODES.UNAUTHORIZED);
        expect(responseTestWrapper.body).toEqual('Unauthorized operation!');
    });
    
})
