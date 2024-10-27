import { DataBase } from "../../app/data/DataBase"
import * as idGenerator from "../../app/data/IdGenerator"

describe('Database tests CRUD', () => {
    type SomeTypeWithId = {
        id: string,
        name: string,
        color: string
    }
    const someData = {
        id: '',
        name: 'name',
        color: 'blue'
    }
    const someData2 = {
        id: '',
        name: 'name2',
        color: 'blue'
    }
    const fakeId = '1234'
    let sut: DataBase<SomeTypeWithId>
    beforeEach(() => {
        sut = new DataBase<SomeTypeWithId>()
        jest.spyOn(idGenerator, 'generateRandomId').mockReturnValue(fakeId)
    })
    test('insert data in database', async () => {
        const actual = await sut.insert(someData)
        expect(actual).toBe(fakeId)
    })
    test('find inserted data', async () => {
        const id = await sut.insert(someData)
        const actual = await sut.getBy('id', id)
        expect(actual).toBe(someData)
    })
    test('should get all element with same property', async () => {
        const data1 = await sut.insert(someData)
        const data2 = await sut.insert(someData2)
        const actual = await sut.findAllBy('color', 'blue')
        expect(actual).toEqual([someData, someData2])
    })
    test('should update one element by id', async () => {
        const id = await sut.insert(someData)
        const expectedColor = 'red'
        await sut.update(id,'color', expectedColor)
        const object = await sut.getBy('id',id)
        const actualColor = object?.color
        expect(actualColor).toBe(expectedColor)
    })
    test('should delete one element by id', async () => {
        const id = await sut.insert(someData)
        await sut.delete(id);
        const object = await sut.getBy('id',id)
        expect(object).toBeUndefined()
    })
    test('should get all exists elements', async () => {
        const data1 = await sut.insert(someData)
        const data2 = await sut.insert(someData2)
        const actual = await sut.getAllElements()
        expect(actual).toEqual([someData,someData2])
    })
})