import React from 'react';
import { connect } from 'react-redux';
import {  getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { exportTN08, getCourse, updateCourse } from '../redux';
import FileSaver from 'file-saver';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormSelect, FormCheckbox, CirclePageButton, renderTable, TableCell, AdminModal  } from 'view/component/AdminPage';


class HoiDongTotNghiepModal extends AdminModal {
    state = {};
    componentDidMount() {
        T.ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = (item) => {
        const { _id, name, chucVu, nhiemVu, gender, thuKyBaoCao} = item || { _id: null, name: '', chucVu: '', nhiemVu:'', gender:'male', thuKyBaoCao: false};
        this.itemName.value(name || '');
        this.itemChucVu.value(chucVu || '');
        this.itemNhiemVu.value(nhiemVu || '');
        this.itemGender.value(gender || 'male');
        this.itemThuKyBaoCao.value(thuKyBaoCao || false);
        this.setState({_id: _id });
    }

    onSubmit = () => {
        const _id = this.state._id;
        const { hoiDongKiemTraKetThucKhoa, courseId } = this.props;
        const changes = {
            name: this.itemName.value(),
            chucVu: this.itemChucVu.value(),
            nhiemVu: this.itemNhiemVu.value(),
            gender: this.itemGender.value(),
            thuKyBaoCao: this.itemThuKyBaoCao.value(),
        };
        if(_id){
            const index = hoiDongKiemTraKetThucKhoa.findIndex(item => item._id == _id);
            if(index != -1){
                changes._id = _id;
                hoiDongKiemTraKetThucKhoa[index] = changes;
            } else{
                hoiDongKiemTraKetThucKhoa.push(changes);
            }
        } else {
            hoiDongKiemTraKetThucKhoa.push(changes);
        }
        this.props.update(courseId, { hoiDongKiemTraKetThucKhoa: hoiDongKiemTraKetThucKhoa }, () => this.hide());       
    }

    render = () => this.renderModal({
        title: 'Chỉnh sửa thành viên hội dồng',
        body: (
            <div className='row'>
                <FormTextBox ref={e => this.itemName = e} className='col-md-8' label='Tên' readOnly={false} />
                <FormSelect ref={e => this.itemGender = e} className='col-md-4' label='Giới tính' data={[{id:'male', text:'Nam'}, {id: 'female', text:'Nữ'}]} readOnly={false} />
                <FormTextBox ref={e => this.itemChucVu = e} className='col-md-6' label='Chức vụ' readOnly={false} />
                <FormTextBox ref={e => this.itemNhiemVu = e} className='col-md-6' label='Nhiệm vụ' readOnly={false} />
                <FormCheckbox ref={e => this.itemThuKyBaoCao = e} className='col-md-6' label='Thư ký báo cáo' readOnly={false} ></FormCheckbox>
            </div>),
    });
}
class AdminReportTN08Page extends AdminPage {
    state = { searchText: '' };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/report/xet-ket-qua-tot-nghiep').parse(window.location.pathname);
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
                            this.setState({course: data, courseId: params._id, hoiDongKiemTraKetThucKhoa: data.item.hoiDongKiemTraKetThucKhoa});
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    exportTN08 = () => {
        const courseId = this.state.courseId;
        const bienBan = {
            hocVienKhoa: this.totalStudentCourse.value(),
            vangThi: this.vangThi.value(),
            thiLai: this.thiLai.value(),
            tongHocVien: this.totalStudent.value(),
            datYeuCau: this.datYeuCau.value(),
            duTieuChuan: this.duTieuChuan.value(),
        };
        if(!bienBan.hocVienKhoa || !bienBan.vangThi || !bienBan.thiLai || !bienBan.tongHocVien || !bienBan.datYeuCau || !bienBan.duTieuChuan){
            T.notify('Vui lòng điền đủ các trường thông tin !', 'danger');
        } else if(courseId){
            this.props.exportTN08(courseId, bienBan, (data) => {
                FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'BB Hop Xet Ket Qua Tot Nghiep.docx');
            });
        } else{
            T.notify('Danh sách học viên trống!', 'danger');
        }
    };

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => {
        let { hoiDongChamThi, courseId} = this.state;
        e.preventDefault();
        T.confirm('Xoá thành viên hội đồng', 'Bạn có chắc muốn xoá thành viên hội đồng ' + item.name, true, isConfirm =>{
            if(isConfirm){
                hoiDongChamThi = hoiDongChamThi.filter(thanhVien => thanhVien._id != item._id);
                this.props.updateCourse(courseId, {hoiDongChamThi});
            }
        });
    };

    render() {
        const permission = this.getUserPermission('course',['report']);
        if(permission.report){
            permission.write = true;
            permission.delete = true;
        }
        const course = this.props.course && this.props.course.item ? this.props.course.item : { hoiDongChamThi: [], giaoVienChamThi:[] };
        const list = (course && course.hoiDongKiemTraKetThucKhoa) ? course.hoiDongKiemTraKetThucKhoa : [];
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Họ và tên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giới tính</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Chức vụ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nhiệm vụ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>

                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={item.name} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.gender == 'female' ? 'Nữ' : 'Nam'} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.chucVu} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.nhiemVu} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>)
        });
        const backRoute = `/user/course/${this.state.courseId}/report`;
        return this.renderPage({
            icon: 'fa fa-users', // select icon
            title: 'BB Họp xét kết quả tốt nghiệp (Phụ lục TN08)',
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>,<Link key={1} to={'/user/course/' + this.state.courseId + '/report'}>Báo cáo</Link>,'BB Họp xét kết quả tốt nghiệp (Phụ lục TN08)'],
            content: <>
                <div className='tile'>
                    <div className='row'>
                        <h3 className='tile-title col-md-12' style={{ paddingLeft: 15, marginBottom: 5 }}>Thông tin biên bản</h3>
                        <FormTextBox ref={e => this.totalStudentCourse = e} className={'col-md-3'} label='Tổng số danh sách học viên chính khoá' readOnly={false} />
                        <FormTextBox ref={e => this.vangThi = e} className={'col-md-3'} label='Số học viên vắng thi' readOnly={false} />
                        <FormTextBox ref={e => this.thiLai = e} className={'col-md-3'} label='Danh sách học viên thi lại' readOnly={false} />
                        <FormTextBox ref={e => this.totalStudent = e} className={'col-md-3'} label='Tổng số học viên dự thi' readOnly={false} />
                        <FormTextBox ref={e => this.datYeuCau = e} className={'col-md-3'} label='Số học viên thi đạt yêu cầu các môn' readOnly={false} />
                        <FormTextBox ref={e => this.duTieuChuan = e} className={'col-md-3'} label='Tổng số học viên đủ tiêu chuẩn cấp chứng chỉ sơ cấp nghề' readOnly={false} />
                    </div>
                </div>
                <div className='tile'>
                    <h3 className='tile-title col-md-12' style={{ paddingLeft: 15, marginBottom: 5 }}>Thành viên hội đồng</h3>
                    {table}
                </div>
                <HoiDongTotNghiepModal readOnly={false} hoiDongKiemTraKetThucKhoa={list} courseId={course._id} ref={e => this.modal = e} update={this.props.updateCourse} />
                <CirclePageButton type='create' style={{right: '75px'}} onClick={this.create} />
                <CirclePageButton type='export' onClick={() => this.exportTN08()} />
            </>,
            backRoute
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course});
const mapActionsToProps = { updateCourse, getCourseTypeAll, exportTN08, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminReportTN08Page);
