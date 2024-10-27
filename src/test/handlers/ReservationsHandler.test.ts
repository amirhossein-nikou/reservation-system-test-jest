import { IncomingMessage, ServerResponse } from "http";
import { Authorizer } from "../../app/auth/Authorizer";
import { ReservationsDataAccess } from "../../app/data/ReservationsDataAccess";
import { ReservationsHandler } from "../../app/handlers/ReservationsHandler";
import { Account } from "../../app/model/AuthModel";
import { HTTP_CODES, HTTP_METHODS } from "../../app/model/ServerModel";
import { Reservation } from "../../app/model/ReservationModel";
const getRequestBodyMock = jest.fn()
jest.mock("../../app/utils/Utils", () => ({
    getRequestBody: () => getRequestBodyMock()
}))
describe('ReservationsHandler system test', () => {
    let sut: ReservationsHandler
    const request = {
        method: 'undefined',
        headers: { authorization: '' },
        url: ''
    }
    const responseMock = {
        statusCode: 0,
        writeHead: jest.fn(),
        write: jest.fn()
    }
    const reservationsDataAccessMoke = {
        createReservation: jest.fn(),
        getAllReservations: jest.fn(),
        getReservation: jest.fn(),
        updateReservation: jest.fn(),
        deleteReservation: jest.fn()
    }
    const authorizerMock = {
        registerUser: jest.fn(),
        validateToken: jest.fn(),
    }
    const id = '1234'
    const tokenId = 'tokenId'
    const someReservation: Reservation = {
        id: '',
        endDate: new Date().toDateString(),
        startDate: new Date().toDateString(),
        room: 'someRoom',
        user: 'someUser'
    }
    beforeEach(() => {
        sut = new ReservationsHandler(
            request as any as IncomingMessage,
            responseMock as any as ServerResponse,
            authorizerMock as any as Authorizer,
            reservationsDataAccessMoke as any as ReservationsDataAccess
        )
        request.headers.authorization = 'abcd';
        authorizerMock.validateToken.mockResolvedValueOnce(true);

    })
    afterEach(() => {
        jest.clearAllMocks()
        request.url = '';
        responseMock.statusCode = 0;
    })
    it('should return nothing for not authorized requests', async () => {
        request.headers.authorization = '1234';
        authorizerMock.validateToken.mockReset();
        authorizerMock.validateToken.mockResolvedValueOnce(false);
        await sut.handleRequest();
        expect(responseMock.statusCode).toBe(HTTP_CODES.UNAUTHORIZED)
        expect(responseMock.write).toBeCalledWith(JSON.stringify(
            'Unauthorized operation!'
        ));
    })

    test('token authorization is invalid', async ()=> {
        request.headers.authorization = '';
        await sut.handleRequest()
        expect(responseMock.statusCode).toBe(HTTP_CODES.UNAUTHORIZED)
        expect(responseMock.write).toHaveBeenCalledWith(JSON.stringify('Unauthorized operation!'))
    })
    test('should do nothing for not supported http methods', async () => {
        request.method = 'SOME-METHOD'
        await sut.handleRequest();
        expect(responseMock.write).not.toHaveBeenCalled();
        expect(responseMock.writeHead).not.toHaveBeenCalled();
    });
    describe('POST method => ', () => {
        beforeEach(() => {
            request.method = HTTP_METHODS.POST
        })
        test('should create reservation from valid request', async () => {
            getRequestBodyMock.mockResolvedValueOnce(someReservation);
            reservationsDataAccessMoke.createReservation.mockResolvedValueOnce(id)
            await sut.handleRequest()
            expect(responseMock.statusCode).toBe(HTTP_CODES.CREATED);
            expect(responseMock.writeHead).toHaveBeenCalledWith(HTTP_CODES.CREATED, { 'Content-Type': 'application/json' });
            expect(responseMock.write).toHaveBeenCalledWith(JSON.stringify({ reservationId: id }))
        })
        test('should not create reservation from invalid request', async () => {
            getRequestBodyMock.mockResolvedValueOnce({});
            await sut.handleRequest()
            expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
            expect(responseMock.write).toHaveBeenCalledWith(JSON.stringify('Incomplete reservation!'))
        })
        test('should not create reservation from invalid fields in request', async () => {
            const moreThanAReservation = { ...someReservation, someField: '123' }
            getRequestBodyMock.mockResolvedValueOnce(moreThanAReservation);
            await sut.handleRequest();
            expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
            expect(responseMock.write).toBeCalledWith(JSON.stringify('Incomplete reservation!'))
        })
    })
    describe('GET method => ', () => {
        beforeEach(() => {
            request.method = HTTP_METHODS.GET
        })
        test('should return list of all reservation', async () => {
            request.url = "/reservations/all"
            reservationsDataAccessMoke.getAllReservations.mockResolvedValueOnce([someReservation])
            await sut.handleRequest()
            expect(responseMock.writeHead).toHaveBeenCalledWith(HTTP_CODES.OK, { 'Content-Type': 'application/json' });
            expect(responseMock.write).toHaveBeenCalledWith(JSON.stringify([someReservation]))
        })
        test('should return reservation with valid id', async () => {
            request.url = `/reservations/${id}`
            reservationsDataAccessMoke.getReservation.mockResolvedValueOnce(someReservation)
            await sut.handleRequest()
            expect(responseMock.writeHead).toHaveBeenCalledWith(HTTP_CODES.OK, { 'Content-Type': 'application/json' });
            expect(responseMock.write).toHaveBeenCalledWith(JSON.stringify(someReservation))
        })
        test('should not return reservation with invalid id', async () => {
            request.url = `/reservations/${id}`
            reservationsDataAccessMoke.getReservation.mockResolvedValueOnce(undefined)
            await sut.handleRequest()
            expect(responseMock.statusCode).toBe(HTTP_CODES.NOT_fOUND);
            expect(responseMock.write).toHaveBeenCalledWith(JSON.stringify(`Reservation with id ${id} not found`))
        })
        test('should return bad request if no id provided', async () => {
            request.url = `/reservations/`
            await sut.handleRequest()
            expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
            expect(responseMock.write).toHaveBeenCalledWith(JSON.stringify('Please provide an ID!'))
        })
    })
    describe('PUT method => ',()=>{
        beforeEach(()=>{
            request.method = HTTP_METHODS.PUT
        })
        test('should update valid reservation', async ()=> {
            request.url = `/reservation/${id}`
            reservationsDataAccessMoke.getReservation.mockResolvedValueOnce(someReservation)
            const body = { // we are going to update this fields
                startDate: 'someDate1',
                endDate: 'someDate2'
            }
            getRequestBodyMock.mockResolvedValueOnce(body); // important
            await sut.handleRequest()
            expect(reservationsDataAccessMoke.updateReservation).toHaveBeenCalledTimes(2)
            expect(reservationsDataAccessMoke.updateReservation).toHaveBeenCalledWith(
                id,
                "startDate",
                body.startDate
            )
            expect(reservationsDataAccessMoke.updateReservation).toHaveBeenCalledWith(
                id,
                "endDate",
                body.endDate
            )
            expect(responseMock.writeHead).toHaveBeenCalledWith(HTTP_CODES.OK,{ 'Content-Type': 'application/json' })
            expect(responseMock.write).toHaveBeenCalledWith(JSON.stringify(`Updated ${Object.keys(body)} of reservation ${id}`))
        })
        test('should return not found if reservation is invalid',async () => {
            request.url = `/reservation/${id}`
            reservationsDataAccessMoke.getReservation.mockResolvedValueOnce(undefined)
            await sut.handleRequest()
            expect(responseMock.statusCode).toBe(HTTP_CODES.NOT_fOUND);
            expect(responseMock.write).toHaveBeenCalledWith(JSON.stringify(`Reservation with id ${id} not found`))
        })
        test('should return bed request if body is invalid',async () => {
            request.url = `/reservation/${id}`
            reservationsDataAccessMoke.getReservation.mockResolvedValueOnce(someReservation)
            getRequestBodyMock.mockResolvedValueOnce({})
            await sut.handleRequest()
            expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
            expect(responseMock.write).toHaveBeenCalledWith(JSON.stringify('Please provide valid fields to update!'))
        })
        test('should provide an id',async () => {
            request.url = `/reservation/`
            await sut.handleRequest()
            expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
            expect(responseMock.write).toHaveBeenCalledWith(JSON.stringify('Please provide an ID!'))
        })
        test('should return bad request if body not contain right keys', async () => {
            request.url = `/reservations/${id}`;
            reservationsDataAccessMoke.getReservation.mockResolvedValueOnce(someReservation);
            getRequestBodyMock.mockResolvedValueOnce({...someReservation,some: 'sss'});
            await sut.handleRequest();
            expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST)
            expect(responseMock.write).toHaveBeenCalledWith(JSON.stringify(
                'Please provide valid fields to update!'
            ));
        });
    })
    describe('DELETE method => ', () => {
        beforeEach(()=> {
            request.method = HTTP_METHODS.DELETE
        })
        test('should remove reservation with valid id', async()=> {
            request.url = `/reservation/${id}`
            await sut.handleRequest()
            expect(reservationsDataAccessMoke.deleteReservation).toHaveBeenCalledWith(id)
            expect(responseMock.statusCode).toBe(HTTP_CODES.OK);
            expect(responseMock.write).toHaveBeenCalledWith(JSON.stringify(`Deleted reservation with id ${id}`))
        })
        test('should return bad request with invalid id', async()=> {
            request.url = `/reservation/`
            await sut.handleRequest()
            expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
            expect(responseMock.write).toHaveBeenCalledWith(JSON.stringify('Please provide an ID!'))
        })
    })
})