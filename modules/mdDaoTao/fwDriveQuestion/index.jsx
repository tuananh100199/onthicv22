import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import driveQuestionCategory from './reduxDriveQuestionCategory';

export default {
    redux: {
        driveQuestionCategory
    },
    routes: [
        {
            path: '/user/drive-question-category',
            component: Loadable({ loading: Loading, loader: () => import('./adminDriveQuestionCategoryPage') }),
        }
    ]
};
