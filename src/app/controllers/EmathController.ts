import { Request, Response, NextFunction } from 'express'
import JourneyService from '../services/JourneyService'
import LessonService from '../services/LessonService'
import KidCornerService from '../services/KidCornerService'

class EmathController {
    // 1. Lấy dữ liệu bản đồ học tập (Journey)
    getJourney = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const profileId = (req.query.profile_id as string) || undefined
            const data = await JourneyService.getJourney(profileId)
            res.json({
                message: 'Lấy dữ liệu hành trình học tập thành công',
                data,
            })
        } catch (error) {
            next(error)
        }
    }

    // 2. Lấy chi tiết bài học và danh sách câu hỏi
    getLessonQuestions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const data = await LessonService.getLessonDetailWithQuestions(id)
            res.json({
                message: 'Lấy câu hỏi bài học thành công',
                data,
            })
        } catch (error) {
            next(error)
        }
    }

    // 3. Nộp kết quả bài học
    submitLesson = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { profile_id, correct_count, total_questions } = req.body

            if (!profile_id) {
                return res.status(400).json({ message: 'Thiếu profile_id của bé' })
            }

            const result = await LessonService.submitLesson(
                profile_id,
                id,
                Number(correct_count) || 0,
                Number(total_questions) || 0,
            )

            res.json({
                message: 'Nộp bài học thành công',
                data: result,
            })
        } catch (error) {
            next(error)
        }
    }

    // 4. Lấy dữ liệu Góc của bé (Badges, Stickers, Stats)
    getKidCorner = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { profile_id } = req.query
            if (!profile_id) {
                return res.status(400).json({ message: 'Thiếu profile_id của bé' })
            }

            const data = await KidCornerService.getKidCornerData(profile_id as string)
            res.json({
                message: 'Lấy dữ liệu Góc của bé thành công',
                data,
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new EmathController()
