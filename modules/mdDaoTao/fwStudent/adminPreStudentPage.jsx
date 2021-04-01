import React from 'react';
import { connect } from 'react-redux';
import { getStudentPage, deleteStudent, updateStudent, createStudent } from './redux';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, CirclePageButton, FormCheckbox, FormImageBox, FormDatePicker, AdminModal, FormTextBox, FormRichTextBox, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';


class PreStudenModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLastname.focus()));
    }

    onShow = (item) => {
        const { _id, firstname, lastname, birthday, user, image, residence, regularResidence, courseType, sex } = item || { _id: null, firstname: '', lastname: '', birthday: '', user: {}, image, residence: '', regularResidence: '', courseType: {}, sex }
        this.itemFirstname.value(firstname);
        this.itemLastname.value(lastname);
        this.itemBirthday.value(birthday);
        this.itemEmail.value(user.email || '');
        this.itemPhoneNumber.value(user.phoneNumber || '');
        this.itemSex.value(sex);
        this.itemResidence.value(residence),
            this.itemRegularResidence.value(regularResidence),
            this.imageBox.setData(`student:${_id || 'new'}`);

        this.courseType.value(courseType ? { id: courseType._id, text: courseType.title } : null);

        this.setState({ _id, image });
    }

    onSubmit = () => {
        const data = {
            firstname: this.itemFirstname.value(),
            lastname: this.itemLastname.value(),
            birthday: this.itemBirthday.value(),
            email: this.itemEmail.value(),
            phoneNumber: this.itemPhoneNumber.value(),
            sex: this.itemSex.value(),
            residence: this.itemResidence.value(),
            regularResidence: this.itemRegularResidence.value(),
            image: this.state.image,

            courseType: this.courseType.value(),
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
        } else if (data.email == '' || !T.validateEmail(data.email)) {
            T.notify('Email không hợp lệ!', 'danger');
            this.itemEmail.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data, this.hide()) : this.props.create(data, this.hide());
        }
    }

    onUploadSuccess = ({ error, item, image }) => {
        if (error) {
            T.notify('Upload hình ảnh thất bại!', 'danger');
        } else {
            image && this.setState({ image });
            // item && this.props.change(item);
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
                    <FormTextBox ref={e => this.itemEmail = e} label='Email' readOnly={readOnly} type='email' />
                </div>
                <FormImageBox ref={e => this.imageBox = e} className='col-md-4' label='Hình đại diện' uploadType='StudentImage' image={this.state.image} readOnly={readOnly}
                    onSuccess={this.onUploadSuccess} />

                <FormTextBox ref={e => this.itemPhoneNumber = e} className='col-md-4' label='Số điện thoại' readOnly={readOnly} />
                <FormDatePicker ref={e => this.itemBirthday = e} className='col-md-4' label='Ngày sinh' readOnly={readOnly} />
                <FormSelect ref={e => this.itemSex = e} className='col-md-4' label='Giới tính' data={[{ id: 'female', text: 'Nữ' }, { id: 'male', text: 'Nam' }]} readOnly={readOnly} />

                <FormRichTextBox ref={e => this.itemResidence = e} className='col-md-12' label='Nơi cư trú' readOnly={readOnly} />
                <FormRichTextBox ref={e => this.itemRegularResidence = e} className='col-md-12' label='Nơi đăng ký hộ khẩu thường trú' readOnly={readOnly} />

                <FormSelect className='col-md-6' ref={e => this.courseType = e} label='Loại khóa học' data={ajaxSelectCourseType} />
            </div>
        });
    }
}

class PreStudentPage extends AdminPage {
    state = { searchText: '', isSearching: false };

    componentDidMount() {
        T.ready(() => T.showSearchBox());
        this.props.getStudentPage(1, 50, undefined);
        T.onSearch = (searchText) => this.props.getStudentPage(undefined, undefined, searchText ? { searchText } : null, () => {
            this.setState({ searchText, isSearching: searchText != '' });
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá ứng viên', 'Bạn có chắc muốn xoá ứng viên này?', true, isConfirm =>
        isConfirm && this.props.deleteStudent(item._id));
    create = (e) => e.preventDefault() || this.modal.show();

    render() {
        const permission = this.getUserPermission('student', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.student && this.props.student.page ?
            this.props.student.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list && list.filter(item => item.course == null),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%' }}>Họ và Tên</th>
                    <th style={{ width: '30%' }}>Email</th>
                    <th style={{ width: '20%' }}>Di động</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hạng đăng ký</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.lastname + ' ' + item.firstname} />
                    <TableCell type='text' content={item.user && item.user.email} />
                    <TableCell type='text' content={T.mobileDisplay(item.user && item.user.phoneNumber)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.courseType && item.courseType.title} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Ứng viên',
            breadcrumb: ['Ứng viên'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='adminStudent' pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getStudentPage} />
                <PreStudenModal readOnly={!permission.write} ref={e => this.modal = e} create={this.props.createStudent} update={this.props.updateStudent} />
                <CirclePageButton type='export' style={{ right: '70px' }} onClick={() => this.props.history.push('/user/pre-student/import')} />
            </>,
            onCreate: permission.write ? this.create : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.student });
const mapActionsToProps = { getStudentPage, deleteStudent, createStudent, updateStudent };
export default connect(mapStateToProps, mapActionsToProps)(PreStudentPage);
