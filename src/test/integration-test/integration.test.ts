import * as genId from "../../app/data/IdGenerator";
import { Account } from "../../app/model/AuthModel";
import { Reservation } from "../../app/model/ReservationModel";
import { HTTP_CODES, HTTP_METHODS } from "../../app/model/ServerModel";
import { Server } from "../../app/server/Server"
import { makeAwesomeRequest } from "./utils/http-client";

describe('integration tests => ', () => {
    let server: Server;
    beforeAll(async () => {
        server = new Server();
        await server.startServer()
    })
    afterAll(async () => {
        await server.stopServer()
    })
    const user: Account = {
        id: '',
        password: "pass",
        userName: "username"
    }
    const reservation: Reservation = {
        id: '',
        endDate: 'end',
        room: 'room',
        startDate: 'start',
        user: 'username'
    }
    const URL: string = 'http://localhost:8080'
    test('should register new user', async () => {
        const result = await fetch(`${URL}/register`, {
            method: HTTP_METHODS.POST,
            body: JSON.stringify(user),
        })
        const resultBody = await result.json()
        expect(result.status).toBe(HTTP_CODES.CREATED);
        expect(resultBody.userId).toBeDefined()
        console.log(`connected to => ${process.env.HOST}:${process.env.PORT}`);
    })
    test('should register new user - use http module', async () => {
        const result = await makeAwesomeRequest({
            method: HTTP_METHODS.POST,
            host: 'localhost',
            port: 8080,
            path: '/register'
        }, user)
        expect(result.statusCode).toBe(HTTP_CODES.CREATED);
        expect(result.body.userId).toBeDefined()
    })
    let token: string;
    test('should login registered user', async () => {
        const result = await fetch(`${URL}/login`, {
            method: HTTP_METHODS.POST,
            body: JSON.stringify(user),
        })
        const resultBody = await result.json()
        token = resultBody.token
        expect(result.status).toBe(HTTP_CODES.CREATED);
        expect(resultBody.token).toBeDefined()
    })
    let reservationId: string
    test('should create new reservation', async () => {
        const result = await fetch(`${URL}/reservation`, {
            method: HTTP_METHODS.POST,
            body: JSON.stringify(reservation),
            headers: {
                authorization: token
            }
        })
        const resultBody = await result.json()
        reservationId = resultBody.reservationId
        expect(result.status).toBe(HTTP_CODES.CREATED);
        expect(resultBody.reservationId).toBeDefined()
    })
    test('should get reservation by id', async () => {
        const result = await fetch(`${URL}/reservation/${reservationId}`, {
            method: HTTP_METHODS.GET,
            headers: {
                authorization: token
            }
        })
        const resultBody = await result.json()
        const expectedReservation = { ...reservation }
        expectedReservation.id = reservationId
        expect(result.status).toBe(HTTP_CODES.OK);
        expect(resultBody).toEqual(expectedReservation)
    })
    test('should get all reservations', async () => {
        for (let i = 0; i < 4; i++) {
            await fetch(`${URL}/reservation`, {
                method: HTTP_METHODS.POST,
                body: JSON.stringify(reservation),
                headers: {
                    authorization: token
                }
            })
        }
        const result = await fetch(`${URL}/reservation/all`, {
            method: HTTP_METHODS.GET,
            headers: {
                authorization: token
            }
        })
        const resultBody = await result.json()
        expect(result.status).toBe(HTTP_CODES.OK);
        expect(resultBody).toHaveLength(5)
    })
    test('should update reservation by id', async () => {
        const updateFiled = {
            room: 'some room',
            startDate: 'new start date'
        }
        const updateResult = await fetch(`${URL}/reservation/${reservationId}`, {
            method: HTTP_METHODS.PUT,
            body: JSON.stringify(updateFiled),
            headers: {
                authorization: token
            }
        })
        const result = await fetch(`${URL}/reservation/${reservationId}`, {
            method: HTTP_METHODS.GET,
            headers: {
                authorization: token
            }
        })
        const resultBody = await result.json()
        const expectedReservation = { ...reservation, ...updateFiled }
        expectedReservation.id = reservationId
        console.log(expectedReservation);
        expect(result.status).toBe(HTTP_CODES.OK);
        expect(resultBody).toEqual(expectedReservation)
    })
    test('should delete reservation by id', async () => {
        const deleteResult = await fetch(`${URL}/reservation/${reservationId}`, {
            method: HTTP_METHODS.DELETE,
            headers: {
                authorization: token
            }
        })
        const result = await fetch(`${URL}/reservation/${reservationId}`, {
            method: HTTP_METHODS.GET,
            headers: {
                authorization: token
            }
        })
        expect(deleteResult.status).toBe(HTTP_CODES.OK);
        expect(result.status).toBe(HTTP_CODES.NOT_fOUND);
    })
    test('should return bad request for undefine id in get request', async () => {
        const result = await fetch(`${URL}/reservation/`, {
            method: HTTP_METHODS.GET,
            headers: {
                authorization: token
            }
        })
        expect(result.status).toBe(HTTP_CODES.BAD_REQUEST);
    })
    test('snap shot demo',async ()=> {
        jest.spyOn(genId,'generateRandomId').mockReturnValueOnce('1234')
        await fetch(`${URL}/reservation`, {
            method: HTTP_METHODS.POST,
            body: JSON.stringify(reservation),
            headers: {
                authorization: token
            }
        })
        const result = await fetch(`${URL}/reservation/1234`, {
            method: HTTP_METHODS.GET,
            headers: {
                authorization: token
            }
        })
        const resultBody = await result.json()
        expect(resultBody).toMatchSnapshot()
    })
})