import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express'
import { AppDataSource } from '../config/data-source'
import logger from '../config/logger'
import { AuthController } from '../controllers/AuthController'
import { User } from '../entity/User'
import { TokenService } from '../services/TokenService'
import { UserService } from '../services/UserService'
import registerValidator from '../validators/register-validator'

const router = express.Router()
const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository)
const tokenService = new TokenService()

const authController = new AuthController(userService, logger, tokenService)
router.post('/register', registerValidator, (async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return await authController.register(req, res, next)
}) as RequestHandler)

export default router
