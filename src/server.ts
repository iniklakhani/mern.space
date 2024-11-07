import app from './app'
import { Config } from './config'
import { AppDataSource } from './config/data-source'
import logger from './config/logger'
import { User } from './entity/User'
import { UserService } from './services/UserService'

const startServer = async () => {
  const PORT = Config.PORT
  try {
    const connection = await AppDataSource.initialize()
    logger.info('Database connected successfully!')

    // START: Create an admin user
    const userRepo = connection.getRepository(User)
    const userServier = new UserService(userRepo)
    const adminId = await userServier.createAdminUser()
    if (adminId) {
      logger.info('Admin user created successfully.', { id: adminId })
    }
    // END: Create an admin user

    app.listen(PORT, () => {
      logger.info('Server is up and running!', {
        port: PORT,
      })
    })
  } catch (error) {
    logger.error('Could not start the server', { error })
    process.exit(1)
  }
}

void startServer()
