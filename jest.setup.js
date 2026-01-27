// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill setImmediate for jsdom environment (needed by Prisma)
if (typeof setImmediate === 'undefined') {
  global.setImmediate = (callback, ...args) => {
    return setTimeout(callback, 0, ...args)
  }
  global.clearImmediate = (id) => {
    return clearTimeout(id)
  }
}

// Setup Prisma for tests
import { prisma } from './lib/prisma'

// Ensure Prisma connects before tests
beforeAll(async () => {
  try {
    await prisma.$connect()
  } catch (error) {
    console.warn('Failed to connect to database in test setup:', error)
  }
}, 30000)

// Disconnect after all tests
afterAll(async () => {
  try {
    await prisma.$disconnect()
  } catch (error) {
    // Silently ignore disconnect errors in test environment
  }
}, 30000)
