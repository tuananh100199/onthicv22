import React from 'react';
import { connect } from 'react-redux';
import { getCourse } from './redux.jsx';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import AdminSubjectView from './tabView/adminSubjectView';

const previousRoute = '/user/course';
class EditCoursePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const route = T.routeMatcher('/user/course/:_id'),
                _id = route.parse(window.location.pathname)._id;
            if (_id) {
                this.props.getCourse(_id, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push(previousRoute);
                    } else if (data.item) {
                        this.setState(data.item);
                    } else {
                        this.props.history.push(previousRoute);
                    }
                });
            } else {
                this.props.history.push(previousRoute);
            }
        });
    }

    render() {
        const permission = this.getUserPermission('course');
        const { name, shortDescription, detailDescription, courseType, courseFee, subjects, groups } = this.state;
        const tabs = [
            { title: 'Thông tin chung', component: 'Thông tin chung' },
            { title: 'Môn học', component: <AdminSubjectView permission={permission} /> },
            { title: 'Cố vấn học tập', component: 'Cố vấn học tập' },
            { title: 'Học viên', component: 'Học viên' },
        ];
        return this.renderPage({
            icon: 'fa fa-file',
            title: 'Khóa học: ' + (name || '...'),
            breadcrumb: [<Link to='/user/course'>Khóa học</Link>, 'Chi tiết khóa học'],
            content: <FormTabs id='coursePageTab' contentClassName='tile' tabs={tabs} />,
            backRoute: previousRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getCourse };
export default connect(mapStateToProps, mapActionsToProps)(EditCoursePage);
