import React from 'react';
import { connect } from 'react-redux';
import { getSubject } from './redux';
import { Link } from 'react-router-dom';
import AdminEditInfo from './adminEditInfoTab';
import AdminEditLesson from './adminEditLessonTab';
import AdminEditQuestion from './adminEditQuestionTab';
import { AdminPage, AdminModal, FormTextBox, FormTabs } from 'view/component/AdminPage';

class AdminEditPage extends AdminPage {
    state = {};

    componentDidMount() {
        T.ready('/user/dao-tao/mon-hoc', () => {
            const url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/mon-hoc/edit/:_id').parse(url);
            this.props.getSubject(params._id, data => {
                if (data.error) {
                    T.notify('Lấy môn học bị lỗi!', 'danger');
                    this.props.history.push('/user/dao-tao/mon-hoc');
                } else if (data.item) {
                    this.setState(data.item);
                } else {
                    this.props.history.push('/user/dao-tao/mon-hoc');
                }
            });
        });
    }

    render() {
        const permission = this.getUserPermission('subject'),
            readOnly = !permission.write;
        const tabs = [
            { title: 'Thông tin chung', component: <AdminEditInfo readOnly={readOnly} history={this.props.history} /> },
            { title: 'Bài học', component: <AdminEditLesson readOnly={readOnly} history={this.props.history} /> },
            { title: 'Câu hỏi phản hồi', component: <AdminEditQuestion readOnly={readOnly} history={this.props.history} /> },
        ];
        const renderData = {
            icon: 'fa fa-file',
            title: 'Môn học: ' + this.state.title,
            breadcrumb: [<Link to='/user/dao-tao/mon-hoc'>Môn học</Link>, 'Chỉnh sửa'],
            content: <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />,
        };
        return this.renderPage(renderData);
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getSubject };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);