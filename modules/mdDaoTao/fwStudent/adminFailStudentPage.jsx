import React from 'react';
import { connect } from 'react-redux';
import { getStudentPage, updateStudent } from './redux';
import { createNotification } from 'modules/_default/fwNotification/redux';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { AdminPage, FormRichTextBox, FormSelect, FormDatePicker, renderTable, TableCell, AdminModal, CirclePageButton } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

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


class FailStudentPage extends AdminPage {
    state = { searchText: '' };
    componentDidMount() {
        T.ready('/user/student/fail-exam', () => {
            T.showSearchBox();
            T.onSearch = (searchText) => this.onSearch({ searchText });// search attach coursetype ?
        });
    }

    onSearch = ({ pageNumber, pageSize, searchText = this.state.searchText, courseType = this.courseType.value() }, done) => {
        this.props.getStudentPage(pageNumber, pageSize, { searchText, courseType, datSatHach: false }, () => {
            this.setState({ searchText });
            done && done();
        });
    }

    onChangeCourseType = (courseType) => {
        this.onSearch({ courseType });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    //TODO: TAM  sendNotification
    sendNotification = (e, item) => e.preventDefault() ||
        T.confirm('Gửi thông báo', `Bạn có chắc muốn gửi thông báo Ngày thi sát hạch dự kiến đến học viên ${item.lastname} ${item.firstname} là ${T.dateToText(item.ngayDuKienThiSatHach, 'dd/mm/yyyy')} ?`,
            true, isConfirm => {
                if (isConfirm) {
                    const data = {
                        title: 'Ngày thi sát hạch dự kiến',
                        content: `Ngày thi sát hạch dự kiến của bạn là ${T.dateToText(item.ngayDuKienThiSatHach, 'dd/mm/yyyy')}`,
                        type: '0',
                        course: item.course && item.course._id,
                        user: item.user && item.user._id,
                        sentDate: new Date(),
                    };
                    this.props.createNotification(data, () => T.notify('Gửi thông báo thành công!', 'success'));
                }
            });

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
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày dự kiến thi sát hạch</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Lí do chưa đạt sát hạch</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={<>{`${item.lastname} ${item.firstname}`}<br />{item.identityCard}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.course && item.course.name} />
                    <TableCell content={item.ngayDuKienThiSatHach ? T.dateToText(item.ngayDuKienThiSatHach, 'dd/mm/yyyy') : 'Chưa có'} />
                    <TableCell content={item.liDoChuaDatSatHach || 'Chưa có'} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit}>
                        {permission.write && item.ngayDuKienThiSatHach ?
                            <a className='btn btn-success' href='#' onClick={(e) => this.sendNotification(e, item)}>
                                <i className='fa fa-lg fa-paper-plane' />
                            </a> : null}
                    </TableCell>
                </tr>)
        });
        return this.renderPage({
            icon: 'fa fa-users', // select icon
            title: 'Học viên chưa đạt sát hạch',
            breadcrumb: ['Học viên chưa đạt sát hạch'],
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
                        {this.courseType && this.courseType.value() != null ? table : null}
                    </div>
                </div>
                <CirclePageButton type='import' onClick={() => this.props.history.push('/user/student/import-fail-pass')} />
                {/* <CirclePageButton type='export' style={{ right: 70 }} onClick={() => T.alert('todo')} /> */}
                <StudentModal readOnly={!permission.write} ref={e => this.modal = e} update={this.props.updateStudent} />
                <Pagination pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getStudentPage, updateStudent, createNotification };
export default connect(mapStateToProps, mapActionsToProps)(FailStudentPage);
