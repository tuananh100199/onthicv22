import React from 'react';
import { connect } from 'react-redux';
import {  getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { getStudentPage, updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { exportSH01, getCourse } from '../redux';
import FileSaver from 'file-saver';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox , FormDatePicker, renderTable, TableCell, AdminModal, CirclePageButton } from 'view/component/AdminPage';

class StudentModal extends AdminModal {
    state = {};
    componentDidMount() {
        T.ready(() => this.onShown(() => this.itemLastname.focus()));
    }

    onShow = (item) => {
        this.itemLastname.value(item.lastname || '');
        this.itemFirstname.value(item.firstname || '');
        this.itemIdentityCard.value(item.identityCard || '');
        this.itemResidence.value(item.residence || '');
        this.itemBirth.value(item.birthday || '');
        this.setState({student: item});
    }

    onSubmit = () => {
        const current = this.state.student;
        const listStudent = this.props.listStudent;
        const changes = {
            lastname: this.itemLastname.value(),
            firstname: this.itemFirstname.value(),
            identityCard: this.itemIdentityCard.value(),
            residence: this.itemResidence.value(),
        };
        let index = listStudent.findIndex(student => student._id == current._id);
        if(listStudent[index]) listStudent[index] = changes;
        this.props.updateState({listStudent: listStudent});
        this.props.update(current._id, changes, () => this.hide());       
    }

    render = () => this.renderModal({
        title: 'Chỉnh sửa học viên',
        body: (
            <div className='row'>
                <FormTextBox ref={e => this.itemLastname = e} className='col-md-6' label='Họ' readOnly={false} />
                <FormTextBox ref={e => this.itemFirstname = e} className='col-md-6' label='Tên' readOnly={false} />
                <FormDatePicker className='col-md-6' ref={e => this.itemBirth = e} label='Ngày tháng năm sinh (dd/mm/yyyy)' readOnly={false} type='date-mask' />
                <FormTextBox ref={e => this.itemIdentityCard = e} className='col-md-6' label='Số CMND/CCCD' readOnly={false} />
                <FormTextBox ref={e => this.itemResidence = e} className='col-md-6' label='Nơi cư trú' readOnly={false} />
            </div>),
    });
}

class AdminReportSH01Page extends AdminPage {
    state = { searchText: '' };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/report/danh-sach-du-thi-sat-hach-lai').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (course) {
                    this.props.getStudentPage(undefined, undefined, { courseId: course._id, totNghiep: 'true', datSatHach: 'false' }, (data) => {
                        this.setState({listStudent: data.list, courseId: params._id});
                    });
                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.props.getStudentPage(undefined, undefined, { courseId: params._id, totNghiep: 'true', datSatHach: 'false' }, (data) => {
                                this.setState({listStudent: data.list, courseId: params._id});
                            });
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    exportSH01 = () => {
        const list  = this.props.student && this.props.student.page && this.props.student.page.list;
        const listStudent = this.state.listStudent;
        let listId = listStudent.map(student => student._id);
        if(list && list.length){
            this.props.exportSH01(listId, (data) => {
                FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Phu_Luc_SH01.docx');
            });
        } else{
            T.notify('Danh sách học viên trống!', 'danger');
        }
    };

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xoá học viên', 'Bạn có chắc muốn xoá học viên ' + item.lastname + ' ' + item.firstname, true, isConfirm =>
            isConfirm && this.setState({listStudent: this.state.listStudent.filter((student) => student._id != item._id)}));
    };

    updateState = (newState) => {
        this.setState(newState);
    }

    render() {
        const permission = this.getUserPermission('student', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem } = this.props.student && this.props.student.page ?
            this.props.student.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const list = this.state.listStudent;
        const backRoute = `/user/course/${this.state.courseId}/report`;
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Họ và tên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>CMND/CCCD</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày sinh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nơi cư trú</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Lý do sát hạch</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nội dung</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số chứng chỉ sơ cấp</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ghi chú</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>

                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={<>{`${item.lastname} ${item.firstname}`}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.identityCard} />
                    <TableCell content={item.birthday ? T.dateToText(item.birthday,'dd/mm/yyyy') : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.residence} />
                    <TableCell content={'VH'} />
                    <TableCell content={'H+Đ'} />
                    <TableCell content={''} />
                    <TableCell content={''} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>)
        });
        return this.renderPage({
            icon: 'fa fa-users', // select icon
            title: 'Danh sách thí sinh được phép dự sát hạch lại để cấp GPLX (Phụ lục SH01)',
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>,<Link key={1} to={'/user/course/' + this.state.courseId + '/report'}>Báo cáo</Link>,'Danh sách thí sinh được phép dự sát hạch lại để cấp GPLX (Phụ lục SH01)'],
            content: <>
                <div className='tile'>
                    <div className='tile-body'>
                        {table}
                    </div>
                </div>
                <StudentModal readOnly={false} updateState={this.updateState} listStudent={this.state.listStudent} courseId={this.state.courseId} ref={e => this.modal = e} update={this.props.updateStudent} />
                <CirclePageButton type='export' onClick={() => this.exportSH01()} />
                <Pagination name='pageCourse' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} style={{ left: 320 }}
                    getPage={(pageNumber, pageSize) => this.props.getStudentPage(pageNumber, pageSize, { courseId: this.state.courseId, totNghiep: 'true', datSatHach: 'false' })} />
            </>,
            backRoute
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student});
const mapActionsToProps = { getStudentPage, updateStudent, getCourseTypeAll, exportSH01, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminReportSH01Page);
