import { getRequestBody } from "../../../app/utils/Utils"
import { RequestTestWrapper } from "../test-utils/RequestTestWrapper"
const requestTestWrapper = new RequestTestWrapper()

describe('test utils system', ()=> {
    test('Utils', async ()=> {
        const obj = {
            name: 'amir',
            age: 23,
            liveIn: 'iran'
        }
        const objToString = JSON.stringify(obj)
        jest.spyOn(requestTestWrapper,'on').mockImplementation((event, cb) => {
            if (event == "data") {
                cb('a' + objToString)
            } else {
                cb()
            }
        })
        await expect(getRequestBody(requestTestWrapper as any)).rejects.toThrow("Unexpected token 'a', \"a{\"name\":\"\"... is not valid JSON")
    })
})