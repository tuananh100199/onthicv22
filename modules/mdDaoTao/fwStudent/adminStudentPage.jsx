import React from 'react';
import { connect } from 'react-redux';
import { } from './redux';
import { Link } from 'react-router-dom';
import { getAllCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';

class StudentPage extends AdminPage {
    componentDidMount() {
        this.props.getAllCourseType();
        T.ready();
    }

    render() {
        const permission = this.getUserPermission('student', ['read', 'write', 'delete', 'candidate']);
        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Học viên',
            breadcrumb: ['Học viên'],
            content: <>
                TODO: Học viên (course != null)
            </>,
            // onCreate: permission.write ? this.create : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, courseType: state.courseType });
const mapActionsToProps = { getAllCourseType };
export default connect(mapStateToProps, mapActionsToProps)(StudentPage);