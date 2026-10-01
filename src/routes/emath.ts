import { Router } from 'express'
import EmathController from '../app/controllers/EmathController'

const router = Router()

// Bản đồ hành trình (Journey)
router.get('/journey', EmathController.getJourney)

// Chi tiết bài học & câu hỏi
router.get('/lessons/:id/questions', EmathController.getLessonQuestions)

// Nộp bài tập
router.post('/lessons/:id/submit', EmathController.submitLesson)

// Góc của bé (Huy hiệu, Bạn nhỏ, Thống kê)
router.get('/kid-corner', EmathController.getKidCorner)

export default router
