import { Reservation } from "../../app/model/ReservationModel";

expect.extend({
    toBeValidReservation(reservation: Reservation) {
        const validId = (reservation.id.length > 5) ? true : false
        const validUser = (reservation.user.length > 5) ? true : false
        return {
            pass: validId && validUser,
            message: () => 'expect reservation to have valid user and id'
        }
    },
    toHaveUser(reservation: Reservation, user: string) {
        const hasRightUser = reservation.user == user
        return {
            pass: hasRightUser,
            message: () => `expected reservation to have user (${user}), received ${reservation.user}`
        }
    }
})
interface CustomMatchers<R> {
    toBeValidReservation(): R,
    toHaveUser(user: string): R
}
declare global {
    namespace jest {
        interface Matchers<R> extends CustomMatchers<R> {}
    }
}
const reservation: Reservation = {
    id: '123456',
    endDate: 'end',
    room: 'room',
    startDate: 'start',
    user: 'username'
}
describe('custom matcher test', ()=> {
    test('use matchers to validate reservation', ()=> {
        expect(reservation).toBeValidReservation()
        expect(reservation).toHaveUser('username')
    })
})