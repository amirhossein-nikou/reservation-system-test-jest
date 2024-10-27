import { DataBase } from "../../app/data/DataBase";
import { ReservationsDataAccess } from "../../app/data/ReservationsDataAccess";
import { Reservation } from "../../app/model/ReservationModel";
import * as IdGenerator from '../../app/data/IdGenerator';
const insertMock = jest.fn();
const getByMock = jest.fn();
const getAllMock = jest.fn();
const updateMock = jest.fn();
const deleteMock = jest.fn();
jest.mock("../../app/data/DataBase", () => {
    return {
        DataBase: jest.fn().mockImplementation(() => {
            return {
                insert: insertMock,
                getBy: getByMock,
                update: updateMock,
                delete: deleteMock,
                getAllElements: getAllMock,
            }
        })
    }
})
const sampleReservation: Reservation = {
    id: '',
    endDate: 'end',
    room: 'room',
    startDate: 'start',
    user: 'username'
}

describe('ReservationsDataAccess system tests', () => {
    let sut: ReservationsDataAccess

    const fakeId = '1234'
    beforeEach(() => {
        sut = new ReservationsDataAccess()
        expect(DataBase).toHaveBeenCalledTimes(1)
        jest.spyOn(IdGenerator, 'generateRandomId').mockReturnValueOnce(fakeId);
    })
    afterEach(() => {
        jest.clearAllMocks()
    })
    test('should insert new reservation and return id', async () => {
        insertMock.mockResolvedValueOnce(fakeId);
        const actualId = await sut.createReservation(sampleReservation);
        expect(actualId).toBe(fakeId);
        expect(insertMock).toHaveBeenCalledWith(sampleReservation)
    })
    test('should update reservation', async () => {
        const actualId = await sut.updateReservation(fakeId, 'endDate', 'someDate');
        expect(updateMock).toHaveBeenCalledWith(fakeId, 'endDate', 'someDate')
    })
    test('should remove reservation', async () => {
        const actualId = await sut.deleteReservation(fakeId);
        expect(deleteMock).toHaveBeenCalledWith(fakeId)
    })
    test('should get one reservation', async () => {
        getByMock.mockResolvedValueOnce(sampleReservation)
        const actual = await sut.getReservation(fakeId);
        expect(actual).toEqual(sampleReservation)
        expect(getByMock).toHaveBeenCalledWith('id', fakeId)
    })
    test('should get all reservation', async () => {
        getAllMock.mockResolvedValueOnce([sampleReservation])
        const actual = await sut.getAllReservations();
        expect(actual).toEqual([sampleReservation])
    })
})