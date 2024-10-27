import { DataBase } from "../../app/data/DataBase"
import { UserCredentialsDataAccess } from "../../app/data/UserCredentialsDataAccess"
import { Account } from "../../app/model/AuthModel"

const insertMock = jest.fn()
const getByMock = jest.fn()
jest.mock("../../app/data/DataBase", () => {
    return {
        DataBase: jest.fn().mockImplementation(() => {
            return {
                insert: insertMock,
                getBy: getByMock
            }
        })
    }
})
describe('UserCredentialsDataAccess system test ', () => {
    let sut: UserCredentialsDataAccess
    const sampleAccount: Account = {
        id: '',
        password: 'pass',
        userName: 'username'
    }
    const fakeId = '123456'
    beforeEach(() => {
        sut = new UserCredentialsDataAccess()
        expect(DataBase).toHaveBeenCalledTimes(1)
    })
    afterEach(() => {
        jest.clearAllMocks()
    })

    test('should add user and return userId', async () => {
        insertMock.mockResolvedValueOnce(fakeId)
        const actualId = await sut.addUser(sampleAccount)
        expect(actualId).toBe(fakeId)
        expect(insertMock).toHaveBeenCalledWith(sampleAccount)
    })
    test('should get user by userId', async () => {
        getByMock.mockResolvedValueOnce(sampleAccount)
        const actualUser = await sut.getUserById(fakeId)
        expect(actualUser).toEqual(sampleAccount)
        expect(getByMock).toHaveBeenCalledWith('id',fakeId)
    })
    test('should get user by username', async () => {
        getByMock.mockResolvedValueOnce(sampleAccount)
        const actualUser = await sut.getUserByUserName(sampleAccount.userName)
        expect(actualUser).toEqual(sampleAccount)
        expect(getByMock).toHaveBeenCalledWith('userName',sampleAccount.userName)
    })
})