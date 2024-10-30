import app from './app'
import { Config } from './config'
import logger from './config/logger'

const startServer = () => {
  const PORT = Config.PORT
  try {
    app.listen(PORT, () => {
      logger.info('Server is up and running!', {
        port: PORT,
      })
    })
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

startServer()
