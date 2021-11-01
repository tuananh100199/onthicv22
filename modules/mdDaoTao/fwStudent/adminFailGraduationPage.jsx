import React from 'react';
import { connect } from 'react-redux';
import { exportExamStudent, getStudentPage, updateStudent } from './redux';
import { createNotification } from 'modules/_default/fwNotification/redux';
import { getCourseTypeAll, ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { AdminPage, FormRichTextBox, FormSelect, FormDatePicker, renderTable, TableCell, AdminModal, CirclePageButton } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class StudentModal extends AdminModal {
    state = {};
    componentDidMount() {
        T.ready(() => this.onShown(() => this.liDoChuaTotNghiep.focus()));
    }

    onShow = (item) => {
        this.liDoChuaTotNghiep.value(item.liDoChuaTotNghiep || '');
        this.ngayDuKienThiTotNghiep.value(item.ngayDuKienThiTotNghiep || '');
        this.setState(item);
    }

    onSubmit = () => {
        const changes = {
            liDoChuaTotNghiep: this.liDoChuaTotNghiep.value().trim(),
            ngayDuKienThiTotNghiep: this.ngayDuKienThiTotNghiep.value(),
        };
        this.props.update(this.state._id, changes, () => this.hide());
    }

    render = () => this.renderModal({
        title: 'Chỉnh sửa học viên chưa tốt nghiệp',
        body: (
            <div className='row'>
                <FormDatePicker className='col-12' ref={e => this.ngayDuKienThiTotNghiep = e} label='Ngày dự kiến thi tốt nghiệp (dd/mm/yyyy)' readOnly={this.props.readOnly} type='date-mask' />
                <FormRichTextBox className='col-12' ref={e => this.liDoChuaTotNghiep = e} label='Lí do chưa tốt nghiệp' readOnly={this.props.readOnly} />
            </div>),
    });
}


class FailGraduationPage extends AdminPage {//TODO: Vinh
    state = { searchText: '' };
    componentDidMount() {
        T.ready('/user/student/fail-graduation', () => {
            T.showSearchBox();
            this.props.getCourseTypeAll(data => {
                const courseTypes = data.map(item => ({ id: item._id, text: item.title }));
                this.courseType.value(courseTypes[0]);
            });
            T.onSearch = (searchText) => this.onSearch({ searchText });// search attach coursetype ?
        });
    }

    onSearch = ({ pageNumber, pageSize, searchText = this.state.searchText, courseType = this.courseType.value() }, done) => {
        this.props.getStudentPage(pageNumber, pageSize, { searchText, courseType, totNghiep: false }, () => {
            this.setState({ searchText });
            done && done();
        });
    }

    onChangeCourseType = (courseType) => {
        this.setState({ courseId: courseType });
        this.onSearch({ courseType });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    render() {
        const permission = this.getUserPermission('student', ['read', 'write']);
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.student && this.props.student.page ?
            this.props.student.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Họ và tên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày dự kiến thi tốt nghiệp</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Lí do chưa tốt nghiệp</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={<>{`${item.lastname} ${item.firstname}`}<br />{item.identityCard}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.course && item.course.name} />
                    <TableCell content={item.ngayDuKienThiTotNghiep ? T.dateToText(item.ngayDuKienThiTotNghiep, 'dd/mm/yyyy') : 'Chưa có'} />
                    <TableCell content={item.liDoChuaTotNghiep || 'Chưa có'} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit}>
                        {permission.write && item.ngayDuKienThiTotNghiep ?
                            <a className='btn btn-success' href='#' onClick={(e) => this.sendNotification(e, item)}>
                                <i className='fa fa-lg fa-paper-plane' />
                            </a> : null}
                    </TableCell>
                </tr>)
        });
        return this.renderPage({
            icon: 'fa fa-users', // select icon
            title: 'Học viên chưa tốt nghiệp',
            breadcrumb: ['Học viên chưa tốt nghiệp'],
            content: <>
                <div className='tile'>
                    <div className='tile-body'>
                        <div className='row'>
                            <div className='col-auto'>
                                <label className='col-form-label'>Loại khóa học: </label>
                            </div>
                            <FormSelect ref={e => this.courseType = e} data={ajaxSelectCourseType} placeholder='Loại khóa học'
                                onChange={data => this.onChangeCourseType(data.id)} style={{ margin: 0, width: '200px' }} />
                        </div>
                        {table}
                    </div>
                </div>
                {this.state.courseId ? <CirclePageButton type='export' onClick={() => exportExamStudent(this.state.courseId, 'HVChuaTotNghiep')} /> : null}
                <StudentModal readOnly={!permission.write} ref={e => this.modal = e} update={this.props.updateStudent} />
                <Pagination pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getStudentPage, updateStudent, createNotification, getCourseTypeAll };
export default connect(mapStateToProps, mapActionsToProps)(FailGraduationPage);
