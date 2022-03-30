//TEMPLATES: admin|home
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
// import SectionCourseList from './sectionCourseList';
// import SectionCourse from './sectionCourse';
import course from './redux';

export default {
    init: () => {
        // T.component['all courses'] = {
        //     render: (viewId) => <SectionCourseList viewId={viewId} />,
        //     backgroundColor: '#ef9a9c',
        // };
        // T.component['last course'] = {
        //     render: (viewId) => <SectionCourse viewId={viewId} />,
        //     backgroundColor: '#ef9a9a',
        // };
    },
    redux: {
        parent: 'trainning',
        reducers: { course },
    },
    routes: [
        {
            path: '/user/course',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/course/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/course/:_id/info',
            component: Loadable({ loading: Loading, loader: () => import('./pages/courseInfoPage') })
        },
        {
            path: '/user/course/:_id/study-program',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminStudyProgramPage') })
        },
        {
            path: '/user/course/:_id/subject',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminSubjectPage') })
        },
        {
            path: '/user/course/:_id/graduation-subject',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminGraduationSubjectPage') })
        },
        {
            path: '/user/course/:_id/final-exam-setting',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminFinalExamSettingPage')})
        },
        {
            path: '/user/course/:courseId/final-exam-setting/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminFinalExamPage')})
        },
        {
            path: '/user/course/:_id/manager',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminManagerPage') })
        },
        {
            path: '/user/course/:_id/report',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminReportPage') })
        },
        {
            path: '/user/course/:_id/report/danh-sach-hoc-vien',
            component: Loadable({ loading: Loading, loader: () => import('./report/adminReport3BPage') })
        },
        {
            path: '/user/course/:_id/report/danh-sach-du-thi-sat-hach',
            component: Loadable({ loading: Loading, loader: () => import('./report/adminReport11BPage') })
        },
        {
            path: '/user/course/:_id/report/danh-sach-du-thi-sat-hach-gplx-hang',
            component: Loadable({ loading: Loading, loader: () => import('./report/adminReport12BPage') })
        },
        {
            path: '/user/course/:_id/report/danh-sach-du-thi-sat-hach-gplx',
            component: Loadable({ loading: Loading, loader: () => import('./report/adminReport12CPage') })
        },
        {
            path: '/user/course/:_id/report/danh-sach-du-thi-sat-hach-lai-gplx',
            component: Loadable({ loading: Loading, loader: () => import('./report/adminReport13Page') })
        },
        {
            path: '/user/course/:_id/class',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminClassPage') })
        },
        {
            path: '/user/course/:_id/student',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminStudentPage') })
        },
        {
            path: '/user/course/:_id/teacher',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminTeacherPage') })
        },
        {
            path: '/user/course/:_id/rate-teacher',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminTeacherRatePage') })
        },
        {
            path: '/user/course/:_id/feedback',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminFeedbackPage') })
        },
        {
            path: '/user/course/:_id/forum',
            component: Loadable({ loading: Loading, loader: () => import('modules/mdTruyenThong/fwForum/forumCourseCategoryPage') })
        },
        {
            path: '/user/course/:_courseId/forum/:_categoryid',
            component: Loadable({ loading: Loading, loader: () => import('modules/mdTruyenThong/fwForum/forumCoursePage') })
        },
        {
            path: '/user/course/:_courseId/forum/:_forumId/message',
            component: Loadable({ loading: Loading, loader: () => import('modules/mdTruyenThong/fwForum/forumCourseMessagePage') })
        },
        {
            path: '/user/course/:_id/feedback/:_feedbackId',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminFeedbackDetailPage') })
        },
        {
            path: '/user/course/:_id/feedback-lecturer',
            component: Loadable({ loading: Loading, loader: () => import('./pages/lecturerFeedbackPage') })
        },
        {
            path: '/user/course/:_id/your-students',
            component: Loadable({ loading: Loading, loader: () => import('./pages/lecturerStudentPage') })
        },
        {
            path: '/user/course/:_id/your-students/:_studentId',
            component: Loadable({ loading: Loading, loader: () => import('./pages/lecturerLearningProgressPage') })
        },
        {
            path: '/user/course/:_id/learning',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminLearningProgressPage') })
        },
        {
            path: '/user/course/:_id/comment',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminCommentPage') })
        },
        {
            path: '/user/course/:_courseId/comment/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminCommentInfoPage') })
        },
        {
            path: '/user/course/:_id/import-graduation-exam-score',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminImportDiemThiTotNghiepPage') })
        },
        {
            path: '/user/course/:_id/lecturer/calendar',
            component: Loadable({ loading: Loading, loader: () => import('modules/mdDaoTao/fwTimeTable/lecturerTimeTablePage') })
        },
        {
            path: '/user/course/:_id/lecturer/register-calendar',
            component: Loadable({ loading: Loading, loader: () => import('modules/mdDaoTao/fwRegisterCalendar/pages/lecturerOffCalendarPage') })
        },
        {
            path: '/user/course/:_id/lecturer/student-register-calendar',
            component: Loadable({ loading: Loading, loader: () => import('modules/mdDaoTao/fwRegisterCalendar/pages/lecturerStudentRegisterCalendarPage') })
        },
        {
            path: '/user/course/:_id/calendar',
            component: Loadable({ loading: Loading, loader: () => import('modules/mdDaoTao/fwTimeTable/adminTimeTablePage') })
        },
        {
            path: '/user/course/:_id/register-calendar',
            component: Loadable({ loading: Loading, loader: () => import('modules/mdDaoTao/fwRegisterCalendar/pages/adminOffCalendarPage') })
        },
        {
            path: '/user/course/:_id/student-register-calendar',
            component: Loadable({ loading: Loading, loader: () => import('modules/mdDaoTao/fwRegisterCalendar/pages/adminStudentRegisterCalendarPage') })
        },
        {
            path: '/user/course/:_id/rate-subject',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminRatingPage') })
        },
        {
            path: '/user/course/:_courseId/photo/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminPhotoPage') })
        },
        {
            path: '/user/course/:_id/import-final-score',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminImportFinalScorePage') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userPageView') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/thong-tin/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userCourseInfo') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:_id/phan-hoi',
            component: Loadable({ loading: Loading, loader: () => import('./userCourseFeedbackPage') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:_id/thoi-khoa-bieu',
            component: Loadable({ loading: Loading, loader: () => import('modules/mdDaoTao/fwTimeTable/studentView') })
        },
        {
            path: '/user/course/:_id/additional-profile',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminAdditionalProfilePage') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:_id/tien-do-hoc-tap',
            component: Loadable({ loading: Loading, loader: () => import('./userLearningProgressPage') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:_id/cong-no',
            component: Loadable({ loading: Loading, loader: () => import('./userPaymentInfo') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:_id/cong-no/chinh-thuc',
            component: Loadable({ loading: Loading, loader: () => import('./userPaymentOfficialInfo') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:_id/cong-no/tang-them',
            component: Loadable({ loading: Loading, loader: () => import('./userPaymentExtraInfo') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:_id/cong-no/lich-su',
            component: Loadable({ loading: Loading, loader: () => import('./userPaymentHistory') })
        }
    ],
    Section: {
        // SectionCourse, SectionCourseList,
    }
};