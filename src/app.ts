import cookieParser from 'cookie-parser'
import express, { NextFunction, Request, Response } from 'express'
import { HttpError } from 'http-errors'
import 'reflect-metadata'
import logger from './config/logger'
import authRouter from './routes/auth'
import tenantRouter from './routes/tenant'

const app = express()

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Welcome to auth service.')
})

app.use('/auth', authRouter)
app.use('/tenants', tenantRouter)

// Global error handlers which should be after all other middlewares
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message)
  const statusCode = err.statusCode || err.status || 500

  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        message: err.message,
        path: '',
        location: '',
      },
    ],
  })
})

export default app
