import type {Config} from '@jest/types'

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    collectCoverageFrom: [
        '<rootDir>/src/app/**/*.ts'
    ],
    testMatch: [
        `<rootDir>/src/test/integration-test/**/*.test.ts`
    ],
    setupFiles: [
        `<rootDir>/src/test/integration-test/utils/config.ts`
    ] // use env in integration testing
}
export default config;