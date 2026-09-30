import express from 'express'
const router = express.Router()

import ProfileController from '../app/controllers/ProfileController'
import verifyToken from '~/app/middlewares/verifyToken'

router.use(verifyToken)

router.get('/', ProfileController.getProfiles)
router.get('/:id', ProfileController.getProfileById)
router.post('/', ProfileController.createProfile)
router.put('/:id', ProfileController.updateProfile)
router.delete('/:id', ProfileController.deleteProfile)

export default router
