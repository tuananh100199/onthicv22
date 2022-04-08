import React from 'react';
import { connect } from 'react-redux';
import {  getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { getStudentPage, updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { exportTN03, getCourse, updateCourse } from '../redux';
import FileSaver from 'file-saver';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormSelect, CirclePageButton, renderTable, TableCell, AdminModal } from 'view/component/AdminPage';

class HoiDongTotNghiepModal extends AdminModal {
    state = {};
    componentDidMount() {
        T.ready(() => this.onShown(() => this.itemLastname.focus()));
    }

    onShow = (item) => {
        const { _id, name, chucVu, nhiemVu, gender } = item || { _id: null, name: '', chucVu: '', nhiemVu:'', gender:'male' };
        this.itemName.value(name || '');
        this.itemChucVu.value(chucVu || '');
        this.itemNhiemVu.value(nhiemVu || '');
        this.itemGender.value(gender || 'male');
        this.setState({_id: _id });
    }

    onSubmit = () => {
        const _id = this.state._id;
        const { hoiDongTotNghiep, courseId } = this.props;
        const changes = {
            name: this.itemName.value(),
            chucVu: this.itemChucVu.value(),
            nhiemVu: this.itemNhiemVu.value(),
            gender: this.itemGender.value(),
        };
        if(_id){
            const index = hoiDongTotNghiep.findIndex(item => item._id == _id);
            if(index != -1){
                changes._id = _id;
                hoiDongTotNghiep[index] = changes;
            } else{
                hoiDongTotNghiep.push(changes);
            }
        } else {
            hoiDongTotNghiep.push(changes);
        }
        this.props.update(courseId, { hoiDongTotNghiep }, () => this.hide());       
    }

    render = () => this.renderModal({
        title: 'Chỉnh sửa thành viên hội dồng',
        body: (
            <div className='row'>
                <FormTextBox ref={e => this.itemName = e} className='col-md-8' label='Tên' readOnly={false} />
                <FormSelect ref={e => this.itemGender = e} className='col-md-4' label='Giới tính' data={[{id:'male', text:'Nam'}, {id: 'female', text:'Nữ'}]} readOnly={false} />
                <FormTextBox ref={e => this.itemChucVu = e} className='col-md-6' label='Chức vụ' readOnly={false} />
                <FormTextBox ref={e => this.itemNhiemVu = e} className='col-md-6' label='Nhiệm vụ' readOnly={false} />
            </div>),
    });
}

class AdminReportTN03Page extends AdminPage {
    state = { searchText: '' };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/report/hoi-dong-thi-tot-nghiep').parse(window.location.pathname);
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
                            this.setState({course: data, courseId: params._id, hoiDongTotNghiep: data.item.hoiDongTotNghiep});
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    exportTN03 = () => {
        const courseId = this.state.courseId;
        if(courseId){
            this.props.exportTN03(courseId, (data) => {
                FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'QĐ Thanh Lap Hoi Dong Thi Tot Nghiep.docx');
            });
        } else{
            T.notify('Danh sách thành viên hội đồng trống!', 'danger');
        }
    };

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => {
        let { hoiDongTotNghiep, courseId} = this.state;
        e.preventDefault();
        T.confirm('Xoá thành viên hội đồng', 'Bạn có chắc muốn xoá thành viên hội đồng ' + item.name, true, isConfirm =>{
            if(isConfirm){
                hoiDongTotNghiep = hoiDongTotNghiep.filter(thanhVien => thanhVien._id != item._id);
                this.props.updateCourse(courseId, {hoiDongTotNghiep});
            }
        });
    };

    render() {
        const permission = this.getUserPermission('course',['report']);
        if(permission.report){
            permission.write = true;
            permission.delete = true;
        }
        const course = this.props.course && this.props.course.item ? this.props.course.item : { hoiDongTotNghiep: [] };
        const list = course && course.hoiDongTotNghiep;
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
            title: 'Quyết định thành lập hội đồng thi tốt nghiệp (Phụ lục TN03)',
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>,<Link key={1} to={'/user/course/' + this.state.courseId + '/report'}>Báo cáo</Link>,'Quyết định thành lập hội đồng thi tốt nghiệp (Phụ lục TN03)'],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title col-md-12' style={{ paddingLeft: 15, marginBottom: 5 }}>Thành viên hội đồng</h3>
                    {table}
                </div>
                <CirclePageButton type='export' onClick={() => this.exportTN03()} />
                <CirclePageButton type='create' style={{right: '75px'}} onClick={this.create} />
                <HoiDongTotNghiepModal readOnly={false} hoiDongTotNghiep={list} courseId={course._id} ref={e => this.modal = e} update={this.props.updateCourse} />
            </>,
            backRoute
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course});
const mapActionsToProps = { getStudentPage, updateStudent, getCourseTypeAll, exportTN03, getCourse, updateCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminReportTN03Page);
