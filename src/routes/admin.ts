import { Router } from 'express'
import AdminController from '../app/controllers/AdminController'

const router = Router()

// 1. Metrics & Overview
router.get('/metrics', AdminController.getMetrics)

// 2. User Accounts & Profiles
router.get('/accounts', AdminController.getAccounts)
router.patch('/accounts/:id/status', AdminController.toggleAccountStatus)
router.post('/accounts/:id/reset-pin', AdminController.resetUserPin)
router.delete('/accounts/:id', AdminController.deleteAccount)

// 3. Chapters & Lessons
router.get('/chapters', AdminController.getChapters)
router.post('/chapters', AdminController.saveChapter)
router.put('/chapters/:id', AdminController.saveChapter)
router.delete('/chapters/:id', AdminController.deleteChapter)

router.post('/chapters/:chapterId/lessons', AdminController.saveLesson)
router.put('/chapters/:chapterId/lessons/:lessonId', AdminController.saveLesson)
router.delete('/chapters/:chapterId/lessons/:lessonId', AdminController.deleteLesson)

// 4. Questions
router.post('/lessons/:lessonId/questions', AdminController.saveQuestion)
router.put('/lessons/:lessonId/questions/:questionId', AdminController.saveQuestion)
router.delete('/lessons/:lessonId/questions/:questionId', AdminController.deleteQuestion)

// 5. Badges
router.get('/badges', AdminController.getBadges)
router.post('/badges', AdminController.saveBadge)
router.put('/badges/:id', AdminController.saveBadge)
router.delete('/badges/:id', AdminController.deleteBadge)

export default router
