'use strict'

const bcrypt = require('bcrypt')
const { v7: uuidv7 } = require('uuid')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        const passwordHash = bcrypt.hashSync('123456', 10)

        const adminUserId = uuidv7()
        const parentUserId = uuidv7()

        const profile1Id = uuidv7()
        const profile2Id = uuidv7()

        const badge1Id = uuidv7()
        const badge2Id = uuidv7()
        const badge3Id = uuidv7()

        const chapter1Id = uuidv7()
        const chapter2Id = uuidv7()
        const chapter3Id = uuidv7()

        const lesson1Id = uuidv7()
        const lesson2Id = uuidv7()
        const lesson3Id = uuidv7()
        const lesson4Id = uuidv7()
        const lesson5Id = uuidv7()
        const lesson6Id = uuidv7()

        // 1. Users
        await queryInterface.bulkInsert(
            'users',
            [
                {
                    id: adminUserId,
                    email: 'admin@mathkids.vn',
                    password_hash: passwordHash,
                    full_name: 'Quản trị viên',
                    role: 'admin',
                    status: 'active',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: parentUserId,
                    email: 'mehoa@gmail.com',
                    password_hash: passwordHash,
                    full_name: 'Nguyễn Thị Hoa',
                    role: 'parent',
                    status: 'active',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            { ignoreDuplicates: true },
        )

        // 2. Profiles
        await queryInterface.bulkInsert(
            'profiles',
            [
                {
                    id: profile1Id,
                    user_id: parentUserId,
                    display_name: 'Bé An',
                    birth_date: '2019-05-12',
                    grade: 1,
                    total_stars: 0,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: profile2Id,
                    user_id: parentUserId,
                    display_name: 'Bé Bình',
                    birth_date: '2017-09-03',
                    grade: 3,
                    total_stars: 0,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            { ignoreDuplicates: true },
        )

        // 3. Badges
        await queryInterface.bulkInsert(
            'badges',
            [
                {
                    id: badge1Id,
                    code: 'badge_counting',
                    name: 'Nhà đếm số',
                    description: 'Hoàn thành chương Đếm số 1-10',
                    image_url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=200',
                    rarity: 'common',
                    created_at: new Date(),
                },
                {
                    id: badge2Id,
                    code: 'badge_addition',
                    name: 'Vua phép cộng',
                    description: 'Hoàn thành chương Phép cộng',
                    image_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200',
                    rarity: 'rare',
                    created_at: new Date(),
                },
                {
                    id: badge3Id,
                    code: 'badge_shapes',
                    name: 'Thám tử hình học',
                    description: 'Hoàn thành chương Hình khối',
                    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
                    rarity: 'epic',
                    created_at: new Date(),
                },
            ],
            { ignoreDuplicates: true },
        )

        // 4. Chapters
        await queryInterface.bulkInsert(
            'chapters',
            [
                {
                    id: chapter1Id,
                    title: 'Đếm số từ 1 đến 10',
                    description: 'Học nhận biết mặt số và đếm số lượng từ 1 đến 10',
                    cover_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500',
                    order_index: 1,
                    badge_id: badge1Id,
                    is_published: 1,
                    created_by: adminUserId,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: chapter2Id,
                    title: 'Phép cộng cơ bản',
                    description: 'Làm quen các phép cộng đơn giản trong phạm vi 10',
                    cover_url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500',
                    order_index: 2,
                    badge_id: badge2Id,
                    is_published: 1,
                    created_by: adminUserId,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: chapter3Id,
                    title: 'Nhận biết hình khối',
                    description: 'Nhận biết các hình học quen thuộc: hình tròn, hình vuông, tam giác',
                    cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500',
                    order_index: 3,
                    badge_id: badge3Id,
                    is_published: 1,
                    created_by: adminUserId,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            { ignoreDuplicates: true },
        )

        // 5. Lessons
        await queryInterface.bulkInsert(
            'lessons',
            [
                {
                    id: lesson1Id,
                    chapter_id: chapter1Id,
                    title: 'Làm quen số 1-5',
                    lesson_type: 'practice',
                    order_index: 1,
                    star1_threshold: 50,
                    star2_threshold: 75,
                    star3_threshold: 100,
                    is_published: 1,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: lesson2Id,
                    chapter_id: chapter1Id,
                    title: 'Làm quen số 6-10',
                    lesson_type: 'practice',
                    order_index: 2,
                    star1_threshold: 50,
                    star2_threshold: 75,
                    star3_threshold: 100,
                    is_published: 1,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: lesson3Id,
                    chapter_id: chapter1Id,
                    title: 'Đếm đồ vật',
                    lesson_type: 'game',
                    order_index: 3,
                    star1_threshold: 50,
                    star2_threshold: 75,
                    star3_threshold: 100,
                    is_published: 1,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: lesson4Id,
                    chapter_id: chapter2Id,
                    title: 'Cộng trong phạm vi 5',
                    lesson_type: 'practice',
                    order_index: 1,
                    star1_threshold: 50,
                    star2_threshold: 75,
                    star3_threshold: 100,
                    is_published: 1,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: lesson5Id,
                    chapter_id: chapter2Id,
                    title: 'Cộng trong phạm vi 10',
                    lesson_type: 'quiz',
                    order_index: 2,
                    star1_threshold: 50,
                    star2_threshold: 75,
                    star3_threshold: 100,
                    is_published: 1,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: lesson6Id,
                    chapter_id: chapter3Id,
                    title: 'Hình tròn và vuông',
                    lesson_type: 'practice',
                    order_index: 1,
                    star1_threshold: 50,
                    star2_threshold: 75,
                    star3_threshold: 100,
                    is_published: 1,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            { ignoreDuplicates: true },
        )

        // 6. Questions
        await queryInterface.bulkInsert(
            'questions',
            [
                {
                    id: uuidv7(),
                    lesson_id: lesson1Id,
                    content: 'Có mấy quả táo trong bức tranh?',
                    image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
                    question_type: 'multiple_choice',
                    options_json: JSON.stringify(['2', '3', '4', '5']),
                    correct_answer: '3',
                    skill_tag: 'counting',
                    difficulty: 1,
                    order_index: 1,
                },
                {
                    id: uuidv7(),
                    lesson_id: lesson4Id,
                    content: 'Tính: 2 + 3 = ?',
                    image_url: null,
                    question_type: 'multiple_choice',
                    options_json: JSON.stringify(['4', '5', '6', '7']),
                    correct_answer: '5',
                    skill_tag: 'addition',
                    difficulty: 1,
                    order_index: 1,
                },
            ],
            { ignoreDuplicates: true },
        )
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('questions', null, {})
        await queryInterface.bulkDelete('lessons', null, {})
        await queryInterface.bulkDelete('chapters', null, {})
        await queryInterface.bulkDelete('badges', null, {})
        await queryInterface.bulkDelete('profiles', null, {})
        await queryInterface.bulkDelete('users', null, {})
    },
}
