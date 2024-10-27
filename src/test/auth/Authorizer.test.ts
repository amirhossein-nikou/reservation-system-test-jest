import { Authorizer } from "../../app/auth/Authorizer";
import { SessionTokenDataAccess } from "../../app/data/SessionTokenDataAccess";
import { UserCredentialsDataAccess } from "../../app/data/UserCredentialsDataAccess";
import { Account } from "../../app/model/AuthModel";
// SessionTokenDataAccess mock
const generateTokenMock = jest.fn();
const invalidateTokenMock = jest.fn();
const isValidTokenMock = jest.fn();
jest.mock('../../app/data/SessionTokenDataAccess', () => {
    return {
        SessionTokenDataAccess: jest.fn().mockImplementation(() => {
            return {
                generateToken: generateTokenMock,
                isValidToken: isValidTokenMock,
                invalidateToken: invalidateTokenMock
            }
        })
    }
})
// UserCredentialsDataAccess mock
const addUserMock = jest.fn();
const getUserByIdMock = jest.fn();
const getUserByUserNameMock = jest.fn();
jest.mock('../../app/data/UserCredentialsDataAccess', () => {
    return {
        UserCredentialsDataAccess: jest.fn().mockImplementation(() => {
            return {
                addUser: addUserMock,
                getUserById: getUserByIdMock,
                getUserByUserName: getUserByUserNameMock
            }
        })
    }
})
describe('Authorizer system tests', () => {
    const user: Account = {
        id: '',
        password: 'pass',
        userName: 'username'
    }
    const password = 'pass'
    const userName = 'username'
    const id = '123'
    let sut: Authorizer
    beforeEach(() => {
        sut = new Authorizer()
        expect(SessionTokenDataAccess).toHaveBeenCalledTimes(1)
        expect(UserCredentialsDataAccess).toHaveBeenCalledTimes(1)
    })
    afterEach(() => {
        jest.clearAllMocks()
    })
    // test('should return true for valid Token',async ()=> {
    //     isValidTokenMock.mockResolvedValueOnce(true);
    //     const actual = await sut.validateToken(id)
    //     expect(actual).toBe(true)
    // })
    test('should validate Token', async () => {
        isValidTokenMock.mockResolvedValueOnce(false);
        const actual = await sut.validateToken(id)
        expect(actual).toBe(false)
    })
    test('should create user and return userId', async () => {
        addUserMock.mockResolvedValueOnce(id);
        const actual = await sut.registerUser(userName,password)
        expect(actual).toBe(id)
        expect(addUserMock).toHaveBeenCalledWith(user)
    })
    test('should login user by username password', async () => {
        getUserByUserNameMock.mockResolvedValueOnce(user);
        generateTokenMock.mockResolvedValueOnce(id);
        const actual = await sut.login(userName,password)
        expect(actual).toBe(id)
        expect(getUserByUserNameMock).toHaveBeenCalledWith(userName)
        expect(generateTokenMock).toHaveBeenCalledWith(user)
    })
    test('should logout user by token', async () => {
        await sut.logout(id)
        expect(invalidateTokenMock).toHaveBeenCalledWith(id)
    })
    // test('should login user by username password', async () => {
    //     getUserByUserNameMock.mockResolvedValueOnce(userName);
    //     const actual = await sut.login(userName,password)
    //     expect(actual).toBeUndefined()
    //     expect(getUserByUserNameMock).toHaveBeenCalledWith(userName)
    // })

})