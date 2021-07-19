import React from 'react';
import { connect } from 'react-redux';
import { getPreStudentPage, createPreStudent, updatePreStudent, deletePreStudent } from './redux';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, CirclePageButton, FormImageBox, FormDatePicker, AdminModal, FormTextBox, FormRichTextBox, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';

class PreStudenModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLastname.focus()));
    }

    onShow = (item) => {
        const { _id, firstname, lastname, birthday, user, image, residence, regularResidence, courseType, sex, division, identityCard, planCourse } = item || { _id: null, firstname: '', lastname: '', birthday: '', user: {}, image, residence: '', regularResidence: '', identityCard: '', planCourse: '' };
        this.itemFirstname.value(firstname || '');
        this.itemLastname.value(lastname || '');
        this.itemBirthday.value(birthday);
        this.itemEmail.value(user.email || '');
        this.itemPhoneNumber.value(user.phoneNumber || '');
        this.itemIdentityCard.value(identityCard || '');
        this.itemPlanCourse.value(planCourse || '');
        this.itemSex.value(sex ? sex : 'male');
        this.itemResidence.value(residence || '');
        this.itemCourseType.value(courseType ? { id: courseType._id, text: courseType.title } : null);
        this.itemDivision.value(division ? { id: division._id, text: division.title } : null);
        this.itemRegularResidence.value(regularResidence || '');
        this.imageBox.setData(`pre-student:${_id || 'new'}`);

        this.setState({ _id, image });
    }

    onSubmit = () => {
        const data = {
            firstname: this.itemFirstname.value(),
            lastname: this.itemLastname.value(),
            birthday: this.itemBirthday.value(),
            email: this.itemEmail.value(),
            phoneNumber: this.itemPhoneNumber.value(),
            identityCard: this.itemIdentityCard.value(),
            planCourse: this.itemPlanCourse.value(),
            sex: this.itemSex.value(),
            residence: this.itemResidence.value(),
            regularResidence: this.itemRegularResidence.value(),
            image: this.state.image,
            courseType: this.itemCourseType.value(),
            division: this.itemDivision.value(),
        };
        if (data.lastname == '') {
            T.notify('Họ không được trống!', 'danger');
            this.itemLastname.focus();
        } else if (data.firstname == '') {
            T.notify('Tên không được trống!', 'danger');
            this.itemFirstname.focus();
        } else if (data.phoneNumber == '') {
            T.notify('Số điện thoại không được trống!', 'danger');
            this.itemPhoneNumber.focus();
        } else if (!data.courseType) {
            T.notify('Hạng đăng ký không được trống!', 'danger');
            this.itemCourseType.focus();
        } else if (!data.division) {
            T.notify('Cơ sở đào tạo không được trống!', 'danger');
            this.itemDivision.focus();
        } else if (data.identityCard == '') {
            T.notify('Số CMND/CCCD không được trống!', 'danger');
            this.itemIdentityCard.focus();
        } else if (data.birthday == '') {
            T.notify('Ngày sinh người dùng bị trống!', 'danger');
            this.itemBirthday.focus();
            // } else if (data.planCourse == '') {
            //     T.notify('Khóa dự kiến không được trống!', 'danger');
            //     this.itemPlanCourse.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data, this.hide()) : T.notify('Tạo ứng viên thành công!', 'success') && this.props.create(data, this.hide());
        }
    }

    // eslint-disable-next-line no-unused-vars
    onUploadSuccess = ({ error, item, image }) => {
        if (error) {
            T.notify('Upload hình ảnh thất bại!', 'danger');
        } else {
            image && this.setState({ image });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Ứng viên',
            size: 'large',
            body: <div className='row'>
                <div className='col-md-8'>
                    <div className='row'>
                        <FormTextBox className='col-md-8' ref={e => this.itemLastname = e} label='Họ & tên đệm' readOnly={readOnly} />
                        <FormTextBox className='col-md-4' ref={e => this.itemFirstname = e} label='Tên' readOnly={readOnly} />
                    </div>
                    <FormTextBox ref={e => this.itemEmail = e} label='Email' readOnly={this.state._id ? true : readOnly} type='email' />
                </div>
                <FormImageBox ref={e => this.imageBox = e} className='col-md-4' label='Hình đại diện' uploadType='PreStudentImage' image={this.state.image} readOnly={readOnly}
                    onSuccess={this.onUploadSuccess} />

                <FormTextBox type='phone' ref={e => this.itemPhoneNumber = e} className='col-md-4' label='Số điện thoại' />
                <FormDatePicker ref={e => this.itemBirthday = e} className='col-md-4' label='Ngày sinh' readOnly={readOnly} type='date-mask' />
                <FormSelect ref={e => this.itemSex = e} className='col-md-4' label='Giới tính' data={[{ id: 'female', text: 'Nữ' }, { id: 'male', text: 'Nam' }]} readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.itemCourseType = e} label='Hạng đăng ký' data={ajaxSelectCourseType} readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.itemDivision = e} label='Cơ sở đào tạo' data={ajaxSelectDivision} readOnly={readOnly} />
                <FormTextBox className='col-md-6' ref={e => this.itemIdentityCard = e} label='CMND/CCCD' readOnly={readOnly} />
                <FormTextBox className='col-md-6' ref={e => this.itemPlanCourse = e} label='Khóa dự kiến' readOnly={readOnly} />
                <FormRichTextBox ref={e => this.itemResidence = e} className='col-md-12' label='Nơi cư trú' readOnly={readOnly} rows='2' />
                <FormRichTextBox ref={e => this.itemRegularResidence = e} className='col-md-12' label='Nơi đăng ký hộ khẩu thường trú' readOnly={readOnly} rows='2' />
            </div >
        });
    }
}

class PreStudentPage extends AdminPage {
    state = { searchText: '', isSearching: false };

    componentDidMount() {
        T.ready(() => T.showSearchBox());
        this.props.getPreStudentPage(1, 50, undefined);
        T.onSearch = (searchText) => this.props.getPreStudentPage(undefined, undefined, searchText ? { searchText } : null, () => {
            this.setState({ searchText, isSearching: searchText != '' });
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá ứng viên', 'Bạn có chắc muốn xoá ứng viên này?', true, isConfirm =>
        isConfirm && this.props.deletePreStudent(item._id));
    // create = (e) => e.preventDefault() || this.modal.show();

    render() {
        const permission = this.getUserPermission('pre-student', ['read', 'write', 'delete', 'import']),
            permissionUser = this.getUserPermission('user', ['read']);
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.student && this.props.student.prePage ?
            this.props.student.prePage : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list && list.filter(item => item.course == null),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%' }}>Họ và Tên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>CMND/CCCD</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thông tin liên hệ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hạng đăng ký</th>
                    <th style={{ width: '50%' }} nowrap='true'>Cơ sở đào tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.lastname + ' ' + item.firstname} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.identityCard} />
                    <TableCell type='text' content={<label>{permissionUser.read ?
                        <a href={`/user/member?user=${item.user && item.user._id}`}>{item.user && item.user.email}</a> : item.user && item.user.email}<br />{T.mobileDisplay(item.user && item.user.phoneNumber)}</label>} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.courseType && item.courseType.title} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.division ? item.division.title : ''} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr >),
        });
        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Ứng viên',
            breadcrumb: ['Ứng viên'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='adminPreStudent' pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getPreStudentPage} />
                <PreStudenModal readOnly={!permission.write} ref={e => this.modal = e} create={this.props.createPreStudent} update={this.props.updatePreStudent} />
                {permission.import ? <CirclePageButton type='import' style={{ right: '70px' }} onClick={() => this.props.history.push('/user/pre-student/import')} /> : null}
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getPreStudentPage, deletePreStudent, createPreStudent, updatePreStudent };
export default connect(mapStateToProps, mapActionsToProps)(PreStudentPage);
