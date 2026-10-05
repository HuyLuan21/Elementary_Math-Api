import { NextFunction, Request, Response } from 'express'

import AdminService from '../services/AdminService'

class AdminController {
    getMetrics = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await AdminService.getMetrics()
            res.json({ data })
        } catch (error) {
            next(error)
        }
    }

    getAccounts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await AdminService.getAccounts()
            res.json({ data })
        } catch (error) {
            next(error)
        }
    }

    toggleAccountStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await AdminService.toggleAccountStatus(req.params.id)
            res.json({ data })
        } catch (error) {
            next(error)
        }
    }

    resetUserPin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await AdminService.resetUserPin(req.params.id)
            res.json({ message: 'Đặt lại mã PIN thành công' })
        } catch (error) {
            next(error)
        }
    }

    deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await AdminService.deleteAccount(req.params.id)
            res.json({ message: 'Xóa tài khoản thành công' })
        } catch (error) {
            next(error)
        }
    }

    getChapters = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await AdminService.getChapters()
            res.json({ data })
        } catch (error) {
            next(error)
        }
    }

    saveChapter = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await AdminService.saveChapter(req.body)
            res.json({ data })
        } catch (error) {
            next(error)
        }
    }

    deleteChapter = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await AdminService.deleteChapter(req.params.id)
            res.json({ message: 'Xóa chương thành công' })
        } catch (error) {
            next(error)
        }
    }

    saveLesson = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await AdminService.saveLesson(req.params.chapterId, req.body)
            res.json({ data })
        } catch (error) {
            next(error)
        }
    }

    deleteLesson = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await AdminService.deleteLesson(req.params.lessonId)
            res.json({ message: 'Xóa bài học thành công' })
        } catch (error) {
            next(error)
        }
    }

    saveQuestion = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await AdminService.saveQuestion(req.params.lessonId, req.body)
            res.json({ data })
        } catch (error) {
            next(error)
        }
    }

    deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await AdminService.deleteQuestion(req.params.questionId)
            res.json({ message: 'Xóa câu hỏi thành công' })
        } catch (error) {
            next(error)
        }
    }

    getBadges = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await AdminService.getBadges()
            res.json({ data })
        } catch (error) {
            next(error)
        }
    }

    saveBadge = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await AdminService.saveBadge(req.body)
            res.json({ data })
        } catch (error) {
            next(error)
        }
    }

    deleteBadge = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await AdminService.deleteBadge(req.params.id)
            res.json({ message: 'Xóa huy hiệu thành công' })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminController()
