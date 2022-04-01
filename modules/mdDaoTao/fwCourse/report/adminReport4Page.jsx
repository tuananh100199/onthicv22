import React from 'react';
import { connect } from 'react-redux';
import {  getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { getStudentPage, updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { exportPhuLuc4, getCourse } from '../redux';
import FileSaver from 'file-saver';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, renderTable, TableCell, AdminModal, CirclePageButton } from 'view/component/AdminPage';

class SubjectModal extends AdminModal {
    state = {};
    componentDidMount() {
        T.ready(() => this.onShown(() => this.itemLastname.focus()));
    }

    onShow = (item) => {
        this.itemTitle.value(item.title || '');
        this.itemTotalTime.value(item.totalTime || '');
        this.itemLyThuyet.value(item.gioHocLyThuyet || '');
        this.itemTrongHinh.value(item.gioHocTrongHinh || '');
        this.itemTrenDuong.value(item.gioHocTrenDuong || '');
        this.itemCuoiKhoa.value(item.cuoiKhoa || '');
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
        title: 'Chỉnh sửa môn học',
        body: (
            <div className='row'>
                <FormTextBox ref={e => this.itemTitle = e} className='col-md-6' label='Môn học' readOnly={false} />
                <FormTextBox ref={e => this.itemTotalTime = e} className='col-md-6' label='Tổng thời gian học' readOnly={false} />
                <FormTextBox ref={e => this.itemLyThuyet = e} className='col-md-6' label='Lý thuyết(giờ)' readOnly={false} />
                <FormTextBox ref={e => this.itemTrongHinh = e} className='col-md-6' label='TH Trong Hình(giờ)' readOnly={false} />
                <FormTextBox ref={e => this.itemTrenDuong = e} type='number' className='col-md-6' label='TH Trên Đường(giờ)' readOnly={false} />
                <FormTextBox ref={e => this.itemCuoiKhoa = e} type='number' className='col-md-6' label='Kiểm tra cuối khoá(giờ)' readOnly={false} />
            </div>),
    });
}

class AdminReport4Page extends AdminPage {
    state = { searchText: '' };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/report/ke-hoach-dao-tao').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (course) {
                    this.setState({course, courseId: course._id});
                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.setState({course: data, courseId: params._id});
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    exportPhuLuc4 = () => {
        const courseId = this.state.courseId;
        if(courseId){
            this.props.exportPhuLuc4(courseId, (data) => {
                FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Phu_Luc_4.docx');
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
        const course = this.props.course && this.props.course.item ? this.props.course.item : { admins: [] };
        const list = course && course.subjects;
        const backRoute = `/user/course/${this.state.courseId}/report`;
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Môn học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Tổng số giờ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Lý thuyết</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>TH trong hình</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>TH trên đường</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kiểm tra cuối khoá</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={item.title} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.totalTime} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>)
        });
        return this.renderPage({
            icon: 'fa fa-users', // select icon
            title: 'Kế hoạch đào tạo (Phụ lục 4)',
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>,<Link key={1} to={'/user/course/' + this.state.courseId + '/report'}>Báo cáo</Link>,'Kế hoạch đào tạo (Phụ lục 4)'],
            content: <>
                <div className='tile'>
                    <div className='tile-body'>
                        {table}
                    </div>
                </div>
                <SubjectModal readOnly={false} updateState={this.updateState} listStudent={this.state.listStudent} courseId={this.state.courseId} ref={e => this.modal = e} update={this.props.updateStudent} />
                <CirclePageButton type='export' onClick={() => this.exportPhuLuc4()} />
                <Pagination name='pageCourse' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} style={{ left: 320 }}
                    getPage={(pageNumber, pageSize) => this.props.getStudentPage(pageNumber, pageSize, { courseId: this.state.courseId, totNghiep: 'true', datSatHach: 'false' })} />
            </>,
            backRoute
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course});
const mapActionsToProps = { getStudentPage, updateStudent, getCourseTypeAll, exportPhuLuc4, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminReport4Page);
