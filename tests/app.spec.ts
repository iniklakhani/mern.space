import request from 'supertest'
import app from '../src/app'

describe('GET /', () => {
  describe('Test to see if server is up and running', () => {
    it('should return a 200 status code if server is up and running', async () => {
      const response = await request(app).get('/').send()
      expect(response.statusCode).toBe(200)
    })
  })
})
