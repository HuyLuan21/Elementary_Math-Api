import express from 'express'

import ParentController from '../app/controllers/ParentController'
import verifyToken from '~/app/middlewares/verifyToken'

const router = express.Router()

router.use(verifyToken)

router.get('/overview', ParentController.getOverview)
router.get('/profiles/:profileId/report', ParentController.getProfileReport)

export default router
