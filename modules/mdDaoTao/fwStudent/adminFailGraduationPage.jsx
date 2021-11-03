import React from 'react';
import { connect } from 'react-redux';
import { exportExamStudent, getStudentPage, updateStudent } from './redux';
import { createNotification } from 'modules/_default/fwNotification/redux';
import { getNotificationTemplateAll, getNotificationTemplate } from 'modules/mdTruyenThong/fwNotificationTemplate/redux';
import { getCourseTypeAll, ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { AdminPage, FormRichTextBox, FormTextBox, FormSelect, FormDatePicker, renderTable, TableCell, AdminModal, CirclePageButton, FormEditor } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

const defaultTitleTotNghiep = 'Thông báo thời gian thi tốt nghiệp',
    defaultAbstractTotNghiep = 'Thông báo thời gian thi tốt nghiệp khóa {khoa}',
    defaultContentTotNghiep = '<p>Xin chào {ho_ten}({cmnd}),</p>\n<p>Thời gian thi tốt nghiệp khóa {khoa} của bạn là: {ngay_thi_tot_nghiep}</p>';
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

class NotificationModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const { _id, title, content, abstract } = this.props.data || { _id: '', title: '', content: '', abstract: '' };
        let newAbstract = abstract.replaceAll('{ho_ten}', item.lastname + ' ' + item.firstname)
            .replaceAll('{ngay_thi_tot_nghiep}', `${T.dateToText(item.ngayDuKienThiTotNghiep, 'dd/mm/yyyy')}`)
            .replaceAll('{khoa}', item.course && item.course.name)
            .replaceAll('{cmnd}', item.identityCard);
        let newContent = content.replaceAll('{ho_ten}', item.lastname + ' ' + item.firstname)
            .replaceAll('{ngay_thi_tot_nghiep}', `${T.dateToText(item.ngayDuKienThiTotNghiep, 'dd/mm/yyyy')}`)
            .replaceAll('{khoa}', item.course && item.course.name)
            .replaceAll('{cmnd}', item.identityCard);
        this.itemTitle.value(title);
        this.itemAbstract.value(newAbstract);
        this.itemContent.html(newContent);
        this.setState({ _id, item });
    }

    onSend = () => {
        const user = this.state.item && this.state.item.user;
        const data = {
            title: this.itemTitle.value(),
            abstract: this.itemAbstract.value(),
            content: this.itemContent.html(),
            type: '2',
            user: user._id,
            sentDate: new Date(),
        };
        this.props.create(data, () => {
            T.notify('Gửi thông báo thành công!', 'success');
            this.hide();
        });
    }



    render = () => this.renderModal({
        title: 'Thông báo',
        size: 'large',
        dataBackdrop: 'static',
        body: <>
            <FormTextBox ref={e => this.itemTitle = e} label='Chủ đề' readOnly={this.props.readOnly} />
            <FormRichTextBox ref={e => this.itemAbstract = e} label='Mô tả ngắn gọn' readOnly={this.props.readOnly} />
            <FormEditor ref={e => this.itemContent = e} uploadUrl='/user/upload?category=notification' label='Nội dung' readOnly={this.props.readOnly} />
        </>,
        buttons:
            <a className='btn btn-success' href='#' onClick={e => this.onSend(e)} style={{ color: 'white' }}>
                <i className='fa fa-lg fa-paper-plane' /> Gửi thông báo
            </a>
    });
}


class FailGraduationPage extends AdminPage {//TODO: Vinh
    state = { searchText: '' };
    componentDidMount() {
        T.ready('/user/student/fail-graduation', () => {
            T.showSearchBox();
            this.props.getCourseTypeAll(data => {
                const courseTypes = data.length && data.map(item => ({ id: item._id, text: item.title }));
                this.courseType.value(courseTypes.length ? courseTypes[0] : null);
            });
            this.props.getNotificationTemplateAll({}, data => {
                if (data && data.length) {
                    const indexThiTotNghiep = data.findIndex(template => template.type == '2');
                    if (indexThiTotNghiep != -1) {
                        this.setState({ data: data[indexThiTotNghiep] });
                    } else {
                        this.setState({
                            data: {
                                title: defaultTitleTotNghiep,
                                abstract: defaultAbstractTotNghiep,
                                content: defaultContentTotNghiep
                            }
                        });
                    }
                } else {
                    this.setState({
                        data: {
                            title: defaultTitleTotNghiep,
                            abstract: defaultAbstractTotNghiep,
                            content: defaultContentTotNghiep
                        }
                    });
                }
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

    sendNotification = (e, item) => e.preventDefault() || this.notiModal.show(item);

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
                    <TableCell content={item.course && item.course.name} nowrap={'true'} />
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
                <NotificationModal readOnly={!permission.write} ref={e => this.notiModal = e} create={this.props.createNotification} data={this.state.data} />
                <Pagination pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student, notificationTemplate: state.communication.notificationTemplate });
const mapActionsToProps = { getStudentPage, updateStudent, createNotification, getCourseTypeAll, getNotificationTemplateAll, getNotificationTemplate };
export default connect(mapStateToProps, mapActionsToProps)(FailGraduationPage);
