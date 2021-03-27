import React from 'react';
import { connect } from 'react-redux';
import { } from './redux';
import { Link } from 'react-router-dom';
import { getAllCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';

class PreStudentPage extends AdminPage {
    componentDidMount() {
        this.props.getAllCourseType();
        T.ready();
    }

    render() {
        const permission = this.getUserPermission('student', ['read', 'write', 'delete', 'candidate']);
        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Ứng viên',
            breadcrumb: ['Ứng viên'],
            content: <>
                TODO: Ứng viên (course == null). Table hiển thị: Họ và Tên, user.email, user.mobile, courseType
            </>,
            // onCreate: permission.write ? this.create : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, courseType: state.courseType });
const mapActionsToProps = { getAllCourseType };
export default connect(mapStateToProps, mapActionsToProps)(PreStudentPage);