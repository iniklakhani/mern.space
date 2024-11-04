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
  ((req: Request, res: Response, next: NextFunction) => {
    return userController.create(req, res, next)
  }) as RequestHandler,
)

export default router
