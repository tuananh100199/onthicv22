import React from 'react';
import { connect } from 'react-redux';
import {  getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { getStudentPage, updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { exportPhuLuc11B, getCourse } from '../redux';
import FileSaver from 'file-saver';
import { AdminPage, FormRichTextBox, FormDatePicker, renderTable, TableCell, AdminModal } from 'view/component/AdminPage';
// import Pagination from 'view/component/Pagination';

class StudentModal extends AdminModal {
    state = {};
    componentDidMount() {
        T.ready(() => this.onShown(() => this.liDoChuaDatSatHach.focus()));
    }

    onShow = (item) => {
        this.liDoChuaDatSatHach.value(item.liDoChuaDatSatHach || '');
        this.ngayDuKienThiSatHach.value(item.ngayDuKienThiSatHach || '');
        this.setState(item);
    }

    onSubmit = () => {
        const changes = {
            liDoChuaDatSatHach: this.liDoChuaDatSatHach.value().trim(),
            ngayDuKienThiSatHach: this.ngayDuKienThiSatHach.value(),
        };
        this.props.update(this.state._id, changes, () => this.hide());
    }

    render = () => this.renderModal({
        title: 'Chỉnh sửa học viên chưa đạt sát hạch',
        body: (
            <div className='row'>
                <FormDatePicker className='col-12' ref={e => this.ngayDuKienThiSatHach = e} label='Ngày dự kiến thi sát hạch (dd/mm/yyyy)' readOnly={this.props.readOnly} type='date-mask' />
                <FormRichTextBox className='col-12' ref={e => this.liDoChuaDatSatHach = e} label='Lí do chưa đạt sát hạch' readOnly={this.props.readOnly} />
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
                        this.setState({listStudent: data.list});
                    });
                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.props.getStudentPage(undefined, undefined, { courseId: params._id, totNghiep: 'true', datSatHach: 'false' }, (data) => {
                                this.setState({listStudent: data.list});
                            });
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    exportPhuLuc3B = (courseId) => {
        const list  = this.props.student && this.props.student.page && this.props.student.page.list;
        if(list && list.length){
            this.props.exportPhuLuc3B(courseId, (data) => {
                FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Phu_Luc_3B.docx');
            });
        } else{
            T.notify('Danh sách học viên trống!', 'danger');
        }
    };

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    // delete = (e, item) => {
    //     this.setState({

    //     })
    // };

    render() {
        const permission = this.getUserPermission('student', ['read', 'write']);
        let { list } = this.props.student && this.props.student.page ?
            this.props.student.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
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
                    <TableCell content={''} />
                    <TableCell content={''} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>)
        });
        return this.renderPage({
            icon: 'fa fa-users', // select icon
            title: 'Báo cáo lập danh sách học viên (Phụ lục 3B)',
            breadcrumb: ['Báo cáo lập danh sách học viên (Phụ lục 3B)'],
            content: <>
                <div className='tile'>
                    <div className='tile-body'>
                        {table}
                    </div>
                </div>
                <StudentModal readOnly={false} ref={e => this.modal = e} update={this.props.updateStudent} />
                {/* <CirclePageButton type='export' onClick={() => exportExamStudent(this.state.courseId, 'HVChuaDatSatHach')} />
                {this.course && (this.course.value() != '0') ? <CirclePageButton type='custom' customClassName='btn-warning' customIcon='fa-paper-plane' style={{ right: '130px' }} onClick={(e) => this.sendNotificationCourse(e, this.course.value())} /> : null}
                {this.course && (this.course.value() != '0') ? <CirclePageButton type='custom' customClassName='btn-info' customIcon='fa-users' style={{ right: '190px' }} onClick={() => this.exportPhuLuc11B(this.course.value())} /> : null}
               
                <Pagination pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })} /> */}
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student});
const mapActionsToProps = { getStudentPage, updateStudent, getCourseTypeAll, exportPhuLuc11B, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminReport3BPage);
