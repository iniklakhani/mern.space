import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express'
import { AppDataSource } from '../config/data-source'
import logger from '../config/logger'
import { Roles } from '../constants'
import { UserController } from '../controllers/UserController'
import { User } from '../entity/User'
import authenticate from '../middlewares/authenticate'
import { canAccess } from '../middlewares/canAccess'
import { UserService } from '../services/UserService'
import { CreateUserRequest } from '../types'
import createUserValidator from '../validators/create-user-validator'

const router = express.Router()

const userRepo = AppDataSource.getRepository(User)
const userService = new UserService(userRepo)
const userController = new UserController(userService, logger)

router.post(
  '/',
  ((req: Request, res: Response, next: NextFunction) => {
    return authenticate(req, res, next)
  }) as RequestHandler,
  canAccess([Roles.ADMIN]),
  createUserValidator,
  ((req: CreateUserRequest, res: Response, next: NextFunction) => {
    return userController.create(req, res, next)
  }) as RequestHandler,
)

router.get(
  '/',
  ((req, res, next) => {
    return authenticate(req, res, next)
  }) as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) => userController.getAll(req, res, next),
)

router.get(
  '/:id',
  ((req, res, next) => {
    return authenticate(req, res, next)
  }) as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) => userController.getOne(req, res, next),
)

export default router
