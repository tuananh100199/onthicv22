import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import { getTeacher } from './redux';

//import page
import AdminInfoPage from './pages/adminInfoPage';
import AdminCertificationPage from './pages/adminCertificationPage';


class TeacherEditPage extends AdminPage {
    state = { teacher: null };
    componentDidMount() {
        T.ready('/user/teacher');
        const params = T.routeMatcher('/user/teacher/:_id').parse(window.location.pathname);
        if (!params._id) this.props.history.push('/user/teacher');
        else {
            this.props.getTeacher(params._id, item => {
                this.setState({ teacher: item, _id: params._id });
            });
        }
    }

    render() {
        const permission = this.getUserPermission('teacher', ['read', 'write', 'delete']);
        const teacher = this.state.teacher;
        const tabs = [];
        tabs.push({key:tabs.length, title: 'Thông tin chung', component: teacher ? <AdminInfoPage permission={permission} teacher={teacher} history={this.props.history} /> : null });
        tabs.push({key:tabs.length, title: 'Trình độ & văn bằng', component: teacher ? <AdminCertificationPage permission={permission} teacherData={teacher} history={this.props.history} /> : null });
        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Thông tin giáo viên: ' + (this.props.teacher && this.props.teacher.item ? `${this.props.teacher.item.lastname} ${this.props.teacher.item.firstname}` : '...'),
            breadcrumb: [<Link key={0} to='/user/teacher'>Thông tin giáo viên</Link>, 'Chi tiết'],
            content: teacher ? <FormTabs id='teacherTab' tabs={tabs} /> : null,
            
            backRoute: '/user/teacher',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, teacher: state.enrollment.teacher });
const mapActionsToProps = { getTeacher };
export default connect(mapStateToProps, mapActionsToProps)(TeacherEditPage);
