import { DataBase } from "../../app/data/DataBase";
import { SessionTokenDataAccess } from "../../app/data/SessionTokenDataAccess";
import { Account, SessionToken } from "../../app/model/AuthModel";

const insertMock = jest.fn();
const getByMock = jest.fn();
const updateMock = jest.fn();
jest.mock("../../app/data/DataBase",()=> {
    return {
        DataBase: jest.fn().mockImplementation(()=> {
            return {
                insert: insertMock,
                getBy: getByMock,
                update: updateMock
            }
        })
    }
})

const sampleAccount: Account = {
    id: '',
    password: 'pass',
    userName: 'username'
}
const sampleToken: SessionToken = {
    id:'',
    userName: sampleAccount.userName,
    valid: true,
    expirationDate: new Date(1000 * 60 * 60),
}
describe('SessionTokenDataAccess system test', ()=> {
    let sut: SessionTokenDataAccess
    const fakeToken = 'anb1234'
  
    beforeEach(() => {
        sut = new SessionTokenDataAccess()
        expect(DataBase).toHaveBeenCalledTimes(1)
        jest.spyOn(global.Date, 'now').mockReturnValue(0);
    })
    afterEach(() => {
        jest.clearAllMocks();
    });
    test('should return token', async ()=> {
        insertMock.mockResolvedValueOnce(fakeToken);
        const actualToken = await sut.generateToken(sampleAccount);
        expect(actualToken).toBe(fakeToken);
        expect(insertMock).toHaveBeenCalledWith(sampleToken)
    })
    test('should update user token to invalid', async ()=> {
        await sut.invalidateToken(fakeToken)
        expect(updateMock).toHaveBeenCalledWith(fakeToken,'valid',false)
    })  
    test('should return invalid for token', async ()=> {
        getByMock.mockResolvedValueOnce({valid: false})
        const actual = await sut.isValidToken(fakeToken)
        expect(actual).toBe(false)
        //expect(getByMock).toHaveBeenCalledWith('id',fakeToken)
    }) 
    test('should return valid for token', async ()=> {
        getByMock.mockResolvedValueOnce({valid:true})
        const actual = await sut.isValidToken(fakeToken)
        expect(actual).toBe(true)
        //expect(getByMock).toHaveBeenCalledWith('id',fakeToken)
    }) 
    test('should return invalid for undefine token', async ()=> {
        getByMock.mockResolvedValueOnce(undefined)
        const actual = await sut.isValidToken(fakeToken)
        expect(actual).toBe(false)
        //expect(getByMock).toHaveBeenCalledWith('id',fakeToken)
    }) 
})