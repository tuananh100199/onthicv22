import React from 'react';
import { connect } from 'react-redux';
import { exportExamStudent, getStudentPage, updateStudent } from './redux';
import { createNotification } from 'modules/_default/fwNotification/redux';
import { ajaxSelectCourseType, getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { getNotificationTemplateAll, getNotificationTemplate } from 'modules/mdTruyenThong/fwNotificationTemplate/redux';
import { AdminPage, FormRichTextBox, FormSelect, FormDatePicker, FormTextBox, FormEditor, renderTable, TableCell, AdminModal, CirclePageButton } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

const defaultTitleSatHach = 'Thông báo thời gian thi sát hạch',
    defaultAbstractSatHach = 'Thông báo thời gian thi sát hạch khóa {khoa}',
    defaultContentSatHach = '<p>Xin chào {ho_ten}({cmnd}),</p>\n<p>Thời gian thi sát hạch khóa {khoa} của bạn là: {ngay_thi_sat_hach}</p>';
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
            .replaceAll('{ngay_thi_sat_hach}', `${T.dateToText(item.ngayDuKienThiSatHach, 'dd/mm/yyyy')}`)
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
            content: this.itemContent.html(),
            abstract: this.itemAbstract.value(),
            type: '3',
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


class FailStudentPage extends AdminPage {
    state = { searchText: '' };
    componentDidMount() {
        T.ready('/user/student/fail-exam', () => {
            T.showSearchBox();
            this.props.getCourseTypeAll(data => {
                const courseTypes = data.map(item => ({ id: item._id, text: item.title }));
                this.courseType.value(courseTypes[0]);
            });
            this.props.getNotificationTemplateAll({}, data => {
                if (data && data.length) {
                    const index = data.findIndex(template => template.type == '3');
                    if (index != -1) {
                        this.setState({ data: data[index] });
                    } else {
                        this.setState({
                            data: {
                                title: defaultTitleSatHach,
                                abstract: defaultAbstractSatHach,
                                content: defaultContentSatHach
                            }
                        });
                    }
                } else {
                    this.setState({
                        data: {
                            title: defaultTitleSatHach,
                            abstract: defaultAbstractSatHach,
                            content: defaultContentSatHach
                        }
                    });
                }
            });
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
        this.setState({ courseId: courseType });
        this.onSearch({ courseType });
    }

    onChangeNotificationTemplate = (_id) => {
        this.props.getNotificationTemplate(_id, data => {
            this.setState({
                dataNotification: data,
            });
        });
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
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày dự kiến thi sát hạch</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Lí do chưa đạt sát hạch</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={<>{`${item.lastname} ${item.firstname}`}<br />{item.identityCard}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.course && item.course.name} nowrap={'true'} />
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
                        {table}
                    </div>
                </div>
                <CirclePageButton type='import' style={{ right: 70 }} onClick={() => T.alert('todo')} />
                <CirclePageButton type='export' onClick={() => exportExamStudent(this.state.courseId, 'HVChuaDatSatHach')} />
                <StudentModal readOnly={!permission.write} ref={e => this.modal = e} update={this.props.updateStudent} />
                <NotificationModal readOnly={!permission.write} ref={e => this.notiModal = e} create={this.props.createNotification} data={this.state.data} />
                <Pagination pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student, notificationTemplate: state.communication.notificationTemplate });
const mapActionsToProps = { getStudentPage, updateStudent, createNotification, getCourseTypeAll, getNotificationTemplateAll, getNotificationTemplate };
export default connect(mapStateToProps, mapActionsToProps)(FailStudentPage);
