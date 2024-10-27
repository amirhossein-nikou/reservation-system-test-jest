import { getRequestBody } from "../../app/utils/Utils"

const requestMock = {
    on: jest.fn()
}
const obj = {
    name: 'amir',
    age: 23,
    liveIn: 'iran'
}
const objToString = JSON.stringify(obj)

describe('getRequestBody system test', () => {
    test('should return object for valid json', async () => {
        requestMock.on.mockImplementation((event, cb) => {
            if (event == 'data') {
                cb(objToString)
            } else {
                cb()
            }
        })
        const actual = await getRequestBody(requestMock as any);
        expect(actual).toEqual(obj)
    })
    test('should return error for invalid json', async () => {
        requestMock.on.mockImplementation((event, cb) => {
            if (event == "data") {
                cb('a' + objToString)
            } else {
                cb()
            }
        })
        await expect(getRequestBody(requestMock as any)).rejects.toThrow("Unexpected token 'a', \"a{\"name\":\"\"... is not valid JSON")
    })
    test('should throw error for unexpected error', async ()=> {
        const error = new Error('something went wrong');
        requestMock.on.mockImplementation((event, cb) => {
            if (event == "error") {
                cb(error)
            }
        })
        await expect(getRequestBody(requestMock as any)).rejects.toThrow(error.message)
    })
})