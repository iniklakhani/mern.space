import request from 'supertest'
import app from '../../src/app'

describe('POST /auth/register', () => {
  describe('Given all fields', () => {
    it('should return the 201 status code', async () => {
      // AAA - Arrange, Act, Assert

      // Arrange
      const userData = {
        firstName: 'John',
        lastName: 'D',
        email: 'john.d@localhost',
        password: 'secret',
      }

      // Act
      const response = await request(app).post('/auth/register').send(userData)

      // Assert
      expect(response.statusCode).toBe(201)
    })

    it('should return valid JSON response', async () => {
      // Arrange
      const userData = {
        firstName: 'John',
        lastName: 'D',
        email: 'john.d@localhost',
        password: 'secret',
      }

      // Act
      const response = await request(app).post('/auth/register').send(userData)

      // Assert application/json utf-8
      expect(response.headers['content-type']).toEqual(
        expect.stringContaining('json'),
      )
    })

    it('should persist the user in the database', async () => {
      // Arrange
      const userData = {
        firstName: 'John',
        lastName: 'D',
        email: 'john.d@localhost',
        password: 'secret',
      }

      // Act
      await request(app).post('/auth/register').send(userData)

      // Assert
    })
  })
  describe('Fields are missing', () => {})
})
