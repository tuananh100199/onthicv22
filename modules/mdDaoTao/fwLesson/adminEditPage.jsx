import React from 'react';
import { connect } from 'react-redux';
import { updateLesson, getLesson } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs, FormTextBox, FormRichTextBox, FormEditor } from 'view/component/AdminPage';
import AdminEditInfo from './adminEditInfoTab';
import AdminEditLessonQuestion from './adminEditLessonQuestionTab';
import AdminEditLessonVideo from './adminEditLessonVideoTab';

class adminEditPage extends AdminPage {
    state = {};

    componentDidMount() {
        T.ready('/user/dao-tao/bai-hoc', () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/bai-hoc/edit/:_id').parse(url);
            this.props.getLesson(params._id, data => {
                if (data.error) {
                    T.notify('Lấy bài học bị lỗi!', 'danger');
                    this.props.history.push('/user/dao-tao/bai-hoc');
                } else if (data.item) {
                    this.setState(data.item);
                } else {
                    this.props.history.push('/user/dao-tao/bai-hoc');
                }
            });
        });
    }

    render() {
        const permission = this.getUserPermission('lesson'),
            readOnly = !permission.write;
        const tabs = [
            { title: 'Thông tin chung', component: <AdminEditInfo readOnly={readOnly} history={this.props.history} /> },
            { title: 'Video bài giảng', component: <AdminEditLessonVideo readOnly={readOnly} history={this.props.history} /> },
            { title: 'Câu hỏi', component: <AdminEditLessonQuestion readOnly={readOnly} history={this.props.history} /> },
        ];

        const renderData = {
            icon: 'fa fa-book',
            title: 'Bài học: ' + this.state.title,
            breadcrumb: [<Link to='/user/dao-tao/bai-hoc'>Bài học</Link>, 'Chỉnh sửa'],
            content: <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />,
        };
        return this.renderPage(renderData);
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateLesson, getLesson };
export default connect(mapStateToProps, mapActionsToProps)(adminEditPage);
