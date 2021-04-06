import React from 'react';
import { connect } from 'react-redux';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { importPreStudent } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormFileBox, FormCheckbox, FormDatePicker, FormTextBox, FormSelect, TableCell, renderTable, CirclePageButton } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = {};
    onShow = (item) => {
        let { id,
            firstname,
            lastname,
            email,
            phoneNumber,
            sex,
            birthday,
            nationality,
            residence,
            regularResidence,
            identityCard,
            identityIssuedBy,
            identityDate,
            giayPhepLaiXe2BanhSo,
            giayPhepLaiXe2BanhNgay,
            giayPhepLaiXe2BanhNoiCap,
            giayKhamSucKhoe,
            giayKhamSucKhoeNgayKham } = item ||
            {
                firstname: '',
                lastname: '',
                email: '',
                phoneNumber: '',
                sex: '',
                birthday: '',
                nationality: '',
                residence: '',
                regularResidence: '',
                identityCard: '',
                identityIssuedBy: '',
                identityDate: '',
                giayPhepLaiXe2BanhSo: '',
                giayPhepLaiXe2BanhNgay: '',
                giayPhepLaiXe2BanhNoiCap: '',
                giayKhamSucKhoe: '',
                giayKhamSucKhoeNgayKham: ''
            };
        this.setState({ id: id, className: giayKhamSucKhoe ? 'col-md-6' : 'd-none' })
        this.itemFirstname.value(firstname);
        this.itemLastname.value(lastname);
        this.itemEmail.value(email);
        this.itemPhoneNumber.value(phoneNumber);
        this.itemSex.value(sex);
        this.itemBirthday.value(birthday);
        this.itemNationality.value(nationality);
        this.itemResidence.value(residence);
        this.itemRegularResidence.value(regularResidence);
        this.itemIdentityCard.value(identityCard);
        this.itemIdentityIssuedBy.value(identityIssuedBy);
        this.itemIdentityDate.value(identityDate);
        this.itemLincenseNumber.value(giayPhepLaiXe2BanhSo);
        this.itemLincenseDate.value(giayPhepLaiXe2BanhNgay);
        this.itemLincenseIssuedBy.value(giayPhepLaiXe2BanhNoiCap);
        this.itemGiayKhamSucKhoe.value(giayKhamSucKhoe);
        this.itemGiayKhamSucKhoeNgayKham.value(giayKhamSucKhoeNgayKham);
    }

    isChecked = (checked) => {
        this.setState({ className: checked ? 'col-md-6' : 'd-none' })
    }

    onSubmit = () => {
        const data = {
            id: this.state.id,
            firstname: this.itemFirstname.value(),
            lastname: this.itemLastname.value(),
            email: this.itemEmail.value(),
            phoneNumber: this.itemPhoneNumber.value(),
            sex: this.itemSex.value(),
            birthday: this.itemBirthday.value(),
            nationality: this.itemNationality.value(),
            residence: this.itemResidence.value(),
            regularResidence: this.itemRegularResidence.value(),
            identityCard: this.itemIdentityCard.value(),
            identityIssuedBy: this.itemIdentityIssuedBy.value(),
            identityDate: this.itemIdentityDate.value(),
            giayPhepLaiXe2BanhSo: this.itemLincenseNumber.value(),
            giayPhepLaiXe2BanhNgay: this.itemLincenseDate.value(),
            giayPhepLaiXe2BanhNoiCap: this.itemLincenseIssuedBy.value(),
            giayKhamSucKhoe: this.itemGiayKhamSucKhoe.value(),
            giayKhamSucKhoeNgayKham: this.itemGiayKhamSucKhoe.value() ? this.itemGiayKhamSucKhoeNgayKham.value() : null,
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
        } else if (data.email == '') {
            T.notify('Địa chỉ email không được trống!', 'danger');
            this.itemEmail.focus();
        } else if (data.giayKhamSucKhoeNgayKham == 'Invalid Date') {
            T.notify('Ngày khám sức khỏe không chính xác!', 'danger');
            this.itemGiayKhamSucKhoeNgayKham.focus();
        } else {
            this.props.edit(this.state.id, data);
            T.notify('Cập nhật thông tin bài học thành công!', 'success');
            this.hide();
        }
    }

    render = () => this.renderModal({
        title: 'Chỉnh sửa ứng viên',
        size: 'large',
        body: (
            <div className='row'>
                <FormTextBox ref={e => this.itemLastname = e} label='Họ ứng viên' className='col-md-8' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemFirstname = e} label='Tên ứng viên' className='col-md-4' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemEmail = e} label='Email' className='col-md-6' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemPhoneNumber = e} label='Số điện thoại' className='col-md-6' readOnly={this.props.readOnly} />
                <FormSelect ref={e => this.itemSex = e} className='col-md-3' label='Giới tính' data={[{ id: 'female', text: 'Nữ' }, { id: 'male', text: 'Nam' }]} readOnly={this.props.readOnly} />
                <FormDatePicker ref={e => this.itemBirthday = e} className='col-md-3' label='Năm sinh' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemNationality = e} label='Quốc tịch' className='col-md-6' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemResidence = e} label='Nơi cư trú' className='col-md-6' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemRegularResidence = e} label='Nơi đăng ký hộ khẩu thường trú' className='col-md-6' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemIdentityCard = e} label='Số CMND,CCCD' className='col-md-4' readOnly={this.props.readOnly} />
                <FormDatePicker ref={e => this.itemIdentityDate = e} className='col-md-4' label='Ngày cấp' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemIdentityIssuedBy = e} label='Nơi cấp' className='col-md-4' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemLincenseNumber = e} label='Số giấy phép lái xe 2 bánh' className='col-md-4' readOnly={this.props.readOnly} />
                <FormDatePicker ref={e => this.itemLincenseDate = e} className='col-md-4' label='Ngày trúng tuyển' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemLincenseIssuedBy = e} label='Nơi cấp' className='col-md-4' readOnly={this.props.readOnly} />
                <FormCheckbox ref={e => this.itemGiayKhamSucKhoe = e} className='col-md-6' label='Đã có giấy khám sức khỏe' readOnly={this.props.readOnly} onChange={this.isChecked} />
                <FormDatePicker ref={e => this.itemGiayKhamSucKhoeNgayKham = e} className={this.state.className ? this.state.className : 'col-md-6'} label='Ngày khám sức khỏe' readOnly={this.props.readOnly} />
            </div>),
    });
}
class ImportPage extends AdminPage {
    fileBox = React.createRef();
    state = {};
    componentDidMount() {
        T.ready('/user/pre-student');
    }
    onUploadSuccess = (data) => {
        this.setState(data);
        this.itemDivision.value(null);
        this.itemCourseType.value(null)
    }

    showEditModal = (e, item) => e.preventDefault() || this.modalEdit.show(item);

    edit = (studentId, changes) => {
        this.setState(prevState => ({
            data: prevState.data.map(data => data.id === studentId ? changes : data)
        }))
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa thông tin ứng viên', `Bạn có chắc bạn muốn xóa thông tin ứng viên <strong>${item.firstname + ' ' + item.lastname}</strong>?`, true, isConfirm =>
        isConfirm && this.setState(prevState => ({
            data: prevState.data.filter(data => data.id !== item.id)
        }))
    );

    save = () => {
        if (!this.itemDivision.value()) {
            T.notify('Chưa chọn cơ sở đào tạo!', 'danger');
            this.itemDivision.focus();
        } else if (!this.itemCourseType.value()) {
            T.notify('Chưa chọn loại khóa học!', 'danger');
            this.itemCourseType.focus();
        } else {
            this.props.importPreStudent(this.state.data, this.itemDivision.value(), this.itemCourseType.value(), data => {
                if (data.error) {
                    T.notify('Import ứng viên bị lỗi!', 'danger');
                } else {
                    this.props.history.push('/user/pre-student');
                }
            })
        }
    }

    render() {
        const permission = this.getUserPermission('pre-student', ['read', 'write', 'delete', 'import']),
            readOnly = !permission.write;
        const table = renderTable({
            getDataSource: () => this.state.data && this.state.data.length > 0 ? this.state.data : [],
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%' }}>Họ và Tên</th>
                    <th style={{ width: '50%' }}>Email</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số điện thoại</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giới tính</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày sinh</th>
                    {/* <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Quốc tịch</th> */}
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nơi cư trú</th>
                    {/* <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nơi đăng ký hộ khẩu thường trú</th> */}
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số CMND, CCCD</th>
                    {/* <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nơi cấp CMND, CCCD</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày cấp CMND, CCCD</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số giấy phép lái xe 2 bánh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày trúng truyển giấy phép lái xe 2 bánh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'> Nơi cấp giấy phép lái xe 2 bánh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Đã có giấy khám sức khoẻ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày khám sức khoẻ</th> */}
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.lastname + ' ' + item.firstname} />
                    <TableCell type='text' content={item.email} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.mobileDisplay(item.phoneNumber)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.sex.toLowerCase().trim() == 'male' ? 'Nam' : 'Nữ'} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.birthday, 'dd/mm/yyyy')} />
                    {/* <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.nationality} /> */}
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.residence} />
                    {/* <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.regularResidence} /> */}
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.identityCard} />
                    {/* <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.identityIssuedBy} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.identityDate, 'dd/mm/yyyy')} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.giayPhepLaiXe2BanhSo} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.giayPhepLaiXe2BanhNgay, 'dd/mm/yyyy')} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.giayPhepLaiXe2BanhNoiCap} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.giayKhamSucKhoe ? 'Có' : 'Không'} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.giayKhamSucKhoeNgayKham, 'dd/mm/yyyy')} /> */}
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.showEditModal} onDelete={this.delete} />
                </tr>),
        });

        const filebox = (
            <div className='tile'>
                <h3 className='tile-title'>Import danh sách ứng viên</h3>
                <FormFileBox ref={e => this.fileBox = e} uploadType='CandidateFile'
                    onSuccess={this.onUploadSuccess} readOnly={readOnly} />
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button className='btn btn-primary' type='button' onClick={this.save}>
                        <a href='/download/candidate.xlsx' style={{ textDecoration: 'none', color: 'white' }}><i className='fa-fw fa-lg fa fa-download' /> Tải xuống file mẫu</a>
                    </button>
                </div>
            </div >
        );
        const list = (
            <div>
                <div className='tile'>
                    <h3 className='tile-title'>Chọn cơ sở</h3>
                    <FormSelect ref={e => this.itemDivision = e} className='col-md-4' labelStyle={{ display: 'none' }} label={'Chọn cơ sở'} data={ajaxSelectDivision} readOnly={readOnly} />
                    <h3 className='tile-title'>Chọn loại khóa học</h3>
                    <FormSelect ref={e => this.itemCourseType = e} className='col-md-4' labelStyle={{ display: 'none' }} label={'Chọn loại khóa học'} data={ajaxSelectCourseType} readOnly={readOnly} />
                    <h3 className='tile-title'>Danh sách ứng viên</h3>
                    <div className='tile-body' style={{ overflowX: 'auto' }}>
                        {table}
                    </div>
                </div>
                <EditModal ref={e => this.modalEdit = e} readOnly={readOnly} edit={this.edit} />
                <CirclePageButton type='save' onClick={this.save} />
            </div>
        );
        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Nhập ứng viên bằng Excel',
            breadcrumb: [<Link to='/user/pre-student'>Ứng viên</Link>, 'Nhập ứng viên bằng Excel'],
            content: <>
                {filebox}
                {this.state.data && this.state.data.length ? list : null}
            </>,
            backRoute: '/user/pre-student',
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { importPreStudent }
export default connect(mapStateToProps, mapActionsToProps)(ImportPage);
