import React from 'react';
import { connect } from 'react-redux';
import { getStudentPage } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';

class StudentPage extends AdminPage {
    state = { searchText: '', isSearching: false };

    componentDidMount() {
        T.ready(() => T.showSearchBox());
        this.props.getStudentPage(1, 50, undefined);
        T.onSearch = (searchText) => this.props.getStudentPage(undefined, undefined, searchText ? { searchText } : null, () => {
            this.setState({ searchText, isSearching: searchText != '' });
        });
    }

    render() {
        const permission = this.getUserPermission('student', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.student && this.props.student.page ?
            this.props.student.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list && list.filter(item => item.course != null),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '40%' }}>Họ và Tên</th>
                    <th style={{ width: '30%' }}>Email</th>
                    <th style={{ width: '10%' }}>Di động</th>
                    <th style={{ width: '10%' }}>Hạng đăng ký</th>
                    <th style={{ width: '10%' }}>Khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.lastname + ' ' + item.firstname} />
                    <TableCell type='text' content={item.user && item.user.email} />
                    <TableCell type='text' content={T.mobileDisplay(item.user && item.user.phoneNumber)} />
                    <TableCell type='text' content={item.courseType.title} />
                    <TableCell type='text' content={item.course.title} />
                    <TableCell type='buttons' content={item} permission={permission} />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Học viên',
            breadcrumb: ['Học viên'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='adminStudent' pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getStudentPage} />
            </>,
            // onCreate: permission.write ? this.create : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.student });
const mapActionsToProps = { getStudentPage };
export default connect(mapStateToProps, mapActionsToProps)(StudentPage);