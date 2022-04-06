import React from 'react';
import { connect } from 'react-redux';
import {  getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import {  updateSubject } from 'modules/mdDaoTao/fwSubject/redux';
import { exportPhuLuc4, getCourse } from '../redux';
import FileSaver from 'file-saver';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, renderTable, TableCell, AdminModal, CirclePageButton } from 'view/component/AdminPage';

class SubjectModal extends AdminModal {
    state = {};
    componentDidMount() {
        T.ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        this.itemTitle.value(item.title || '');
        this.itemTotalTime.value(item.totalTime || '');
        this.itemLyThuyetLT.value(item.gioHocLyThuyetLT || '');
        this.itemLyThuyetTH.value(item.gioHocLyThuyetTH || '');
        this.itemTrongHinh.value(item.gioHocTrongHinh || '');
        this.itemTrenDuong.value(item.gioHocTrenDuong || '');
        this.itemCuoiKhoa.value(item.cuoiKhoa || '');
        this.setState({subject: item});
    }

    onSubmit = () => {
        const current = this.state.subject;
        const changes = {
            totalTime: this.itemTotalTime.value(),
            gioHocLyThuyetLT: this.itemLyThuyetLT.value(),
            gioHocLyThuyetTH: this.itemLyThuyetTH.value(),
            gioHocTrongHinh: this.itemTrongHinh.value(),
            gioHocTrenDuong: this.itemTrenDuong.value(),
            cuoiKhoa: this.itemCuoiKhoa.value(),
        };
        this.props.update(current._id, changes, () => {
            this.hide();
        });       
    }

    render = () => this.renderModal({
        title: 'Chỉnh sửa môn học',
        size: 'large',
        body: (
            <div className='row'>
                <FormTextBox ref={e => this.itemTitle = e} className='col-md-12' label='Môn học' readOnly={true} />
                <FormTextBox ref={e => this.itemTotalTime = e} className='col-md-6' label='Tổng thời gian học' readOnly={false} />
                <FormTextBox ref={e => this.itemLyThuyetLT = e} className='col-md-6' label='Lý thuyết LT(giờ)' readOnly={false} />
                <FormTextBox ref={e => this.itemLyThuyetTH = e} className='col-md-6' label='Lý thuyết TH(giờ)' readOnly={false} />
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

    render() {
        const permission = this.getUserPermission('course',['report']);
        if(permission.report){
            permission.write = true;
            permission.delete = true;
        }
        const course = this.props.course && this.props.course.item ? this.props.course.item : { subjects:[] };
        const list = course && course.subjects;
        const backRoute = `/user/course/${this.state.courseId}/report`;
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Môn học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Tổng số giờ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Lý thuyết (LT)</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Lý thuyết (TH)</th>
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
                    <TableCell content={item.gioHocLyThuyetLT} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.gioHocLyThuyetTH} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.gioHocTrongHinh} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.gioHocTrenDuong} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.cuoiKhoa} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} />
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
                <SubjectModal readOnly={false} getCourse={this.props.getCourse} listStudent={this.state.listStudent} courseId={this.state.courseId} ref={e => this.modal = e} update={this.props.updateSubject} />
                <CirclePageButton type='export' onClick={() => this.exportPhuLuc4()} />
            </>,
            backRoute
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course});
const mapActionsToProps = { getCourseTypeAll, exportPhuLuc4, getCourse, updateSubject };
export default connect(mapStateToProps, mapActionsToProps)(AdminReport4Page);
