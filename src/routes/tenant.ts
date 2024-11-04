import express, { Request, RequestHandler, Response } from 'express'

const router = express.Router()

router.post('/', ((req: Request, res: Response) => {
  res.status(201).json({})
}) as RequestHandler)

export default router
