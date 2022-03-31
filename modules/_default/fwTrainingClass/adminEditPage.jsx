import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import { getTrainingClass } from './redux';

//import page
import AdminInfoPage from './pages/adminInfoPage';
import AdminListTeacherPage from './pages/adminListTeacherPage';

class TrainingClassEditPage extends AdminPage {
    state = { trainingClass: null };
    componentDidMount() {
        T.ready('/user/training-class');
        const params = T.routeMatcher('/user/training-class/:_id').parse(window.location.pathname);
        if (!params._id) this.props.history.push('/user/training-class');
        else {
            this.props.getTrainingClass(params._id, trainingClass => {
                console.log({trainingClass});
                this.setState({ trainingClass });
            });
        }
    }

    render() {
        const permission = this.getUserPermission('trainingClass', ['read', 'write', 'delete']);
        const trainingClass = this.state.trainingClass;
        const tabs = [];
        tabs.push({key:tabs.length, title: 'Thông tin chung', component: trainingClass ? <AdminInfoPage permission={permission} trainingClass={trainingClass} history={this.props.history} /> : null });
        tabs.push({key:tabs.length, title: 'Danh sách giáo viên tập huấn', component: trainingClass ? <AdminListTeacherPage permission={permission} trainingClass={trainingClass} history={this.props.history} /> : null });
        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Lớp tập huấn: ' + (this.props.trainingClass && this.props.trainingClass.item ?this.props.trainingClass.item.name : '...'),
            breadcrumb: [<Link key={0} to='/user/training-class'>Lớp tập huấn</Link>,this.props.trainingClass && this.props.trainingClass.item ?this.props.trainingClass.item.name : '...' ],
            content: trainingClass ? <FormTabs id='trainingClassTab' tabs={tabs} /> : null,
            backRoute: '/user/training-class',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, trainingClass: state.enrollment.trainingClass });
const mapActionsToProps = { getTrainingClass };
export default connect(mapStateToProps, mapActionsToProps)(TrainingClassEditPage);
