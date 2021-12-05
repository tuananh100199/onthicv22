import React from 'react';
import { connect } from 'react-redux';
import { exportExamStudent, getStudentPage, updateStudent } from './redux';
import { createNotification } from 'modules/_default/fwNotification/redux';
import { getNotificationTemplateAll, getNotificationTemplate } from 'modules/mdTruyenThong/fwNotificationTemplate/redux';
import { getCourseTypeAll, ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { ajaxSelectCourseByCourseType, getCoursePage } from 'modules/mdDaoTao/fwCourse/redux';
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
        const { _id, title, content, abstract, ngayDuKienThiTotNghiep } = this.props.data || { _id: '', title: '', content: '', abstract: '', ngayDuKienThiTotNghiep: '' };
        const thoiGianThiTotNghiepDuKien = T.dateToText(item && item.course && item.course.thoiGianThiTotNghiepDuKien, 'dd/mm/yyyy');
        let newAbstract = '',
        newContent = '';
        if(item && item.list){
            newAbstract = abstract.replaceAll('{ngay_thi_tot_nghiep}', thoiGianThiTotNghiepDuKien)
            .replaceAll('{khoa}', item.course && item.course.name);
            newContent = content.replaceAll('{ngay_thi_tot_nghiep}', thoiGianThiTotNghiepDuKien )
            .replaceAll('{khoa}', item.course && item.course.name);
        } else {
            newAbstract = abstract.replaceAll('{ho_ten}', item.lastname + ' ' + item.firstname)
            .replaceAll('{ngay_thi_tot_nghiep}', item.ngayDuKienThiTotNghiep ? `${T.dateToText(item.ngayDuKienThiTotNghiep, 'dd/mm/yyyy')}` : thoiGianThiTotNghiepDuKien)
            .replaceAll('{khoa}', item.course && item.course.name)
            .replaceAll('{cmnd}', item.identityCard);
            newContent = content.replaceAll('{ho_ten}', item.lastname + ' ' + item.firstname)
            .replaceAll('{ngay_thi_tot_nghiep}', item.ngayDuKienThiTotNghiep ? `${T.dateToText(item.ngayDuKienThiTotNghiep, 'dd/mm/yyyy')}` : thoiGianThiTotNghiepDuKien)
            .replaceAll('{khoa}', item.course && item.course.name)
            .replaceAll('{cmnd}', item.identityCard);  
        }
        this.itemTitle.value(title);
        this.itemNgayDuKien.value(ngayDuKienThiTotNghiep);
        this.itemAbstract.value(newAbstract);
        this.itemContent.html(newContent);
        this.setState({ _id, item, content, abstract, thoiGianThiTotNghiepDuKien });
    }

    onSend = () => {
        const list = this.state.item && this.state.item.list;
        if(list) {
            const handleSendNotification = (index = 0) => {
                if (index == list.length) {
                    T.notify('Gửi thông báo thành công!', 'success');
                    this.hide();
                } else {
                    const user = list[index],
                    abstract = this.itemAbstract.value(),
                    content = this.itemContent.html();
                    let newAbstract = abstract.replaceAll('{ho_ten}', user.lastname + ' ' + user.firstname).replaceAll('{cmnd}', user.identityCard),
                    newContent =  content.replaceAll('{ho_ten}', user.lastname + ' ' + user.firstname).replaceAll('{cmnd}', user.identityCard); 
                    const data = {
                        title: this.itemTitle.value(),
                        abstract: newAbstract,
                        content: newContent,
                        type: '2',
                        user: user.user && user.user._id,
                        sentDate: new Date(),
                    };
                    this.props.create(data, () => {
                        handleSendNotification(index + 1);
                    });
                }
            };
            handleSendNotification();
        } else {
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
        
    }

    changeDate = (date) => {
        let { content, abstract, item } = this.state,
        newAbstract ='',
        newContent='';
        if(item && item.list){
            newAbstract = abstract.replaceAll('{ngay_thi_tot_nghiep}', date)
            .replaceAll('{khoa}', item.course && item.course.name);
            newContent = content.replaceAll('{ngay_thi_tot_nghiep}', date )
            .replaceAll('{khoa}', item.course && item.course.name);
        } else {
            newAbstract = abstract.replaceAll('{ho_ten}', item.lastname + ' ' + item.firstname)
            .replaceAll('{ngay_thi_tot_nghiep}', date)
            .replaceAll('{khoa}', item.course && item.course.name)
            .replaceAll('{cmnd}', item.identityCard);
            newContent = content.replaceAll('{ho_ten}', item.lastname + ' ' + item.firstname)
            .replaceAll('{ngay_thi_tot_nghiep}', date)
            .replaceAll('{khoa}', item.course && item.course.name)
            .replaceAll('{cmnd}', item.identityCard);
            }
        this.itemAbstract.value(newAbstract);
        this.itemContent.html(newContent);
    }



    render = () => this.renderModal({
        title: 'Cấu hình thông báo ' + ((this.state.item && this.state.item.list) ? 'toàn khóa' : 'học viên'),
        size: 'large',
        dataBackdrop: 'static',
        body: <>
            <FormTextBox ref={e => this.itemTitle = e} label='Chủ đề' readOnly={this.props.readOnly} />
            <FormTextBox ref={e => this.itemNgayDuKien = e} smallText={'Ngày thi dự kiến của khóa: '} listParams={[this.state.thoiGianThiTotNghiepDuKien]} label='Ngày dự kiến thi tốt nghiệp' onChange={(e) => this.changeDate(e.target.value)} readOnly={this.props.readOnly} />
            <FormRichTextBox ref={e => this.itemAbstract = e} label='Mô tả ngắn gọn' readOnly={this.props.readOnly} />
            <FormEditor ref={e => this.itemContent = e} uploadUrl='/user/upload?category=notification' label='Nội dung' readOnly={this.props.readOnly} />
        </>,
        buttons:
            <a className='btn btn-success' href='#' onClick={e => this.onSend(e)} style={{ color: 'white' }}>
                <i className='fa fa-lg fa-paper-plane' /> Gửi thông báo
            </a>
    });
}


class FailGraduationPage extends AdminPage {
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

    onSearch = ({ pageNumber, pageSize, searchText = this.state.searchText, course = this.course.value() }, done) => {
        const courseType = this.state.courseTypeId;
        const condition = course == '0' ? { searchText, courseType, totNghiep: false, daThiHetMon: true } : { searchText, course, totNghiep: false, daThiHetMon: true };
        this.props.getStudentPage(pageNumber, pageSize, condition, () => {
            this.setState({ searchText });
            done && done();
        });
    }

    onChangeCourseType = (courseType) => {
        this.setState({ courseTypeId: courseType });
        this.course.value({ id: 0, text: 'Tất cả khóa học' });
        // this.onSearch({ courseType });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    sendNotification = (e, item) => e.preventDefault() || this.notiModal.show(item);

    sendNotificationCourse = (e) => {
        e.preventDefault();
        const list  = this.props.student && this.props.student.page && this.props.student.page.list;
        if(list && list.length){
            const course = list[0] && list[0].course;
            this.notiModal.show({list, course});
        } else{
            T.notify('Danh sách học viên trống!', 'danger');
        }
    }

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
                    <TableCell content={item.course && item.course.name} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.ngayDuKienThiTotNghiep ? T.dateToText(item.ngayDuKienThiTotNghiep, 'dd/mm/yyyy') : 'Chưa có'} />
                    <TableCell content={item.liDoChuaTotNghiep || 'Chưa có'} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit}>
                        {permission.write ?
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
                            <div className='col-auto'>
                                <label className='col-form-label'>Khóa học: </label>
                            </div>
                            <FormSelect ref={e => this.course = e} data={ajaxSelectCourseByCourseType(this.state.courseTypeId)} placeholder='Khóa học'
                                onChange={data => this.onSearch(data.id)} style={{ margin: 0, width: '200px' }} />
                        </div>
                        {this.courseType && this.courseType.value() != null ? table : null}

                    </div>
                </div>
                {this.state.courseTypeId ? <CirclePageButton type='export' onClick={() => exportExamStudent(this.state.courseTypeId, 'HVChuaTotNghiep')} /> : null}
                {this.course && (this.course.value() != '0') ? <CirclePageButton type='custom' customClassName='btn-warning' customIcon='fa-paper-plane' style={{ right: '75px' }} onClick={(e) => this.sendNotificationCourse(e, this.course.value())} /> : null}
                <StudentModal readOnly={!permission.write} ref={e => this.modal = e} update={this.props.updateStudent} />
                <NotificationModal readOnly={!permission.write} ref={e => this.notiModal = e} create={this.props.createNotification} data={this.state.data} />
                <Pagination pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student, notificationTemplate: state.communication.notificationTemplate });
const mapActionsToProps = { getStudentPage, updateStudent, createNotification, getCourseTypeAll, getNotificationTemplateAll, getNotificationTemplate, getCoursePage };
export default connect(mapStateToProps, mapActionsToProps)(FailGraduationPage);
