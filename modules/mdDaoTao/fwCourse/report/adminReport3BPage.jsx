import React from 'react';
import { connect } from 'react-redux';
import {  getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { getStudentPage, updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { exportPhuLuc3B, getCourse } from '../redux';
import FileSaver from 'file-saver';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormCheckbox , FormDatePicker, renderTable, TableCell, AdminModal, CirclePageButton } from 'view/component/AdminPage';

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
        this.itemGiaySucKhoe.value(item.isGiayKhamSucKhoe || false);
        this.itemGPLX.value(item.isBangLaiA1 || false);
        this.itemBirth.value(item.birthday || '');
        this.itemSoNamLaiXe.value(item.soNamLaiXe || 0);
        this.itemKMLaiXe.value(item.soKmLaiXe || 0);
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
            isGiayKhamSucKhoe: this.itemGiaySucKhoe.value(),
            isBangLaiA1: this.itemGPLX.value(),
            birthday: this.itemBirth.value(),
            soNamLaiXe: this.itemSoNamLaiXe.value(),
            soKMLaiXe: this.itemKMLaiXe.value(),
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
                <FormCheckbox ref={e => this.itemGiaySucKhoe = e} className='col-md-3' isSwitch={true} label='Giấy khám sức khoẻ' readOnly={false} />
                <FormCheckbox ref={e => this.itemGPLX = e} className='col-md-3' isSwitch={true} label='Đã có bằng lái xe' readOnly={false} />
                <FormTextBox ref={e => this.itemSoNamLaiXe = e} type='number' className='col-md-6' label='Số năm lái xe' readOnly={false} />
                <FormTextBox ref={e => this.itemKMLaiXe = e} type='number' className='col-md-6' label='Số km lái xe an toàn' readOnly={false} />
            </div>),
    });
}

class AdminReport3BPage extends AdminPage {
    state = { searchText: '' };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/report/danh-sach-hoc-vien').parse(window.location.pathname);
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

    exportPhuLuc3B = () => {
        const list  = this.props.student && this.props.student.page && this.props.student.page.list;
        const listStudent = this.state.listStudent;
        let listId = listStudent.map(student => student._id);
        if(list && list.length){
            this.props.exportPhuLuc3B(listId, (data) => {
                FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Phu_Luc_3B.docx');
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
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày sinh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nơi cư trú</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giấy chứng nhận sức khoẻ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>GPLX</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số năm lái xe</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số km lái xe an toàn</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>

                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={<>{`${item.lastname} ${item.firstname}`}<br />{item.identityCard}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.birthday ? T.dateToText(item.birthday,'dd/mm/yyyy') : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.residence} />
                    <TableCell content={item.isGiayKhamSucKhoe ? 'X' : ''} />
                    <TableCell content={item.isBangLaiA1 ? 'X' : ''} />
                    <TableCell content={item.soNamLaiXe ? item.soNamLaiXe : ''} />
                    <TableCell content={item.soKMLaiXe ? item.soKMLaiXe : ''} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>)
        });
        return this.renderPage({
            icon: 'fa fa-users', // select icon
            title: 'Báo cáo lập danh sách học viên (Phụ lục 3B)',
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>,<Link key={1} to={'/user/course/' + this.state.courseId + '/report'}>Báo cáo</Link>,'Báo cáo lập danh sách học viên (Phụ lục 3B)'],
            content: <>
                <div className='tile'>
                    <div className='tile-body'>
                        {table}
                    </div>
                </div>
                <StudentModal readOnly={false} updateState={this.updateState} listStudent={this.state.listStudent} courseId={this.state.courseId} ref={e => this.modal = e} update={this.props.updateStudent} />
                <CirclePageButton type='export' onClick={() => this.exportPhuLuc3B()} />
                <Pagination name='pageCourse' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} style={{ left: 320 }}
                    getPage={(pageNumber, pageSize) => this.props.getStudentPage(pageNumber, pageSize, { courseId: this.state.courseId, totNghiep: 'true', datSatHach: 'false' })} />
            </>,
            backRoute
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student});
const mapActionsToProps = { getStudentPage, updateStudent, getCourseTypeAll, exportPhuLuc3B, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminReport3BPage);
