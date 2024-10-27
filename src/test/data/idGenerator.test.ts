import { generateRandomId } from "../../app/data/IdGenerator"

describe('test id generator', ()=> {
   
    test('generate random id', ()=> {
        const sut = generateRandomId()
        expect(sut.length).toBe(20)
    })
})