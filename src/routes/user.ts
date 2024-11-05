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
import { CreateUserRequest, UpdateUserRequest } from '../types'
import createUserValidator from '../validators/create-user-validator'
import updateUserValidator from '../validators/update-user-validator'

const router = express.Router()

const userRepo = AppDataSource.getRepository(User)
const userService = new UserService(userRepo)
const userController = new UserController(userService, logger)

router.post(
  '/',
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  createUserValidator,
  ((req: CreateUserRequest, res: Response, next: NextFunction) =>
    userController.create(req, res, next)) as RequestHandler,
)

router.get('/', authenticate as RequestHandler, canAccess([Roles.ADMIN]), ((
  req: Request,
  res: Response,
  next: NextFunction,
) => userController.getAll(req, res, next)) as RequestHandler)

router.get('/:id', authenticate as RequestHandler, canAccess([Roles.ADMIN]), ((
  req: Request,
  res: Response,
  next: NextFunction,
) => userController.getOne(req, res, next)) as RequestHandler)

router.patch(
  '/:id',
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  updateUserValidator,
  ((req: UpdateUserRequest, res: Response, next: NextFunction) =>
    userController.update(req, res, next)) as RequestHandler,
)

router.delete(
  '/:id',
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  ((req: Request, res: Response, next: NextFunction) =>
    userController.deleteOne(req, res, next)) as RequestHandler,
)

export default router
