import User from './UserModel'
import RefreshToken from './RefreshTokenModel'
import Profile from './ProfileModel'
import Chapter from './ChapterModel'
import Lesson from './LessonModel'
import Question from './QuestionModel'
import Sticker from './StickerModel'
import Badge from './BadgeModel'
import ProfileLessonProgress from './ProfileLessonProgressModel'
import ProfileBadge from './ProfileBadgeModel'
import ProfileSticker from './ProfileStickerModel'

const associations = () => {
    const models: any = {
        User,
        RefreshToken,
        Profile,
        Chapter,
        Lesson,
        Question,
        Sticker,
        Badge,
        ProfileLessonProgress,
        ProfileBadge,
        ProfileSticker,
    }

    Object.values(models).forEach((model: any) => {
        if (model.associate) {
            model.associate(models)
        }
    })
}

export default associations
