import React from 'react';
import { connect } from 'react-redux';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';
import { importPreStudent } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormDatePicker, AdminModal, FormFileBox, FormTextBox, FormSelect, TableCell, renderTable, CirclePageButton } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLastname.focus()));
    }

    onShow = (item) => {
        let { id,
            firstname,
            lastname,
            email,
            phoneNumber,
            courseType,
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
                courseType: '',
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
        this.setState({ num: id })
        this.itemFirstname.value(firstname);
        this.itemLastname.value(lastname);
        this.itemEmail.value(email);
        this.itemPhoneNumber.value(phoneNumber);
        this.itemCourseType.value(courseType);
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
        this.itemgiayKhamSucKhoe.value(giayKhamSucKhoe);
        this.itemgiayKhamSucKhoeNgayKham.value(giayKhamSucKhoeNgayKham);
    }

    onSubmit = () => {
        const data = {
            numberic: this.state.num,
            firstname: this.itemFirstname.value(),
            lastname: this.itemLastname.value(),
            email: this.itemEmail.value(),
            phoneNumber: this.itemPhoneNumber.value(),
            courseType: this.itemCourseType.value(),
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
            giayKhamSucKhoe: this.itemgiayKhamSucKhoe.value(),
            giayKhamSucKhoeNgayKham: this.itemgiayKhamSucKhoeNgayKham.value(),
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
        } else if (!data.courseType) {
            T.notify('Hạng đăng ký không được trống!', 'danger');
            this.itemCourseType.focus();
        } else {
            this.props.edit(this.state.num, data)
            this.hide();
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Chỉnh sửa ứng viên',
            size: 'large',
            body: (
                <div className='row'>
                    <div className='col-md-8'>
                        <FormTextBox ref={e => this.itemFirstname = e} label='Họ ứng viên' readOnly={readOnly} />
                        <FormTextBox ref={e => this.itemLastname = e} label='Tên ứng viên' readOnly={readOnly} />
                        <FormTextBox ref={e => this.itemEmail = e} label='Email' readOnly={readOnly} />
                        <FormTextBox ref={e => this.itemPhoneNumber = e} label='Số điện thoại' readOnly={readOnly} />
                        <FormTextBox ref={e => this.itemCourseType = e} label='Hạng đăng ký' readOnly={readOnly} />
                        <FormTextBox ref={e => this.itemSex = e} label='Giới tính' readOnly={readOnly} />
                        <FormDatePicker ref={e => this.itemBirthday = e} className='col-md-4' label='Ngày sinh' readOnly={readOnly} />
                        <FormTextBox ref={e => this.itemNationality = e} label='Quốc tịch' readOnly={readOnly} />
                        <FormTextBox ref={e => this.itemResidence = e} label='Nơi cư trú' readOnly={readOnly} />
                        <FormTextBox ref={e => this.itemRegularResidence = e} label='Nơi đăng ký hộ khẩu thường trú' readOnly={readOnly} />
                        <FormTextBox ref={e => this.itemIdentityCard = e} label='Số CMND,CCCD' readOnly={readOnly} />
                        <FormTextBox ref={e => this.itemIdentityDate = e} label='Ngày cấp' readOnly={readOnly} />
                        <FormTextBox ref={e => this.itemIdentityIssuedBy = e} label='Nơi cấp' readOnly={readOnly} />
                        <FormTextBox ref={e => this.itemLincenseNumber = e} label='Số giấy phép lái xe 2 bánh' readOnly={readOnly} />
                        <FormTextBox ref={e => this.itemLincenseDate = e} label='Ngày trúng tuyển' readOnly={readOnly} />
                        <FormTextBox ref={e => this.itemLincenseIssuedBy = e} label='Nơi cấp' readOnly={readOnly} />
                        <FormTextBox ref={e => this.itemgiayKhamSucKhoe = e} label='Đã có giấy phép lái xe' readOnly={readOnly} />
                        <FormTextBox ref={e => this.itemgiayKhamSucKhoeNgayKham = e} label='Ngày khám sức khỏe' readOnly={readOnly} />
                    </div>
                </div>),
        });
    }
}

class ImportPage extends AdminPage {
    fileBox = React.createRef();
    state = {};

    onUploadSuccess = (data) => {
        this.setState(data);
        this.itemDivision.value(null)
    }

    showEditModal = (e, item) => e.preventDefault() || this.modalEdit.show(item);
    edit = (num, changes) => {
        this.setState(prevState => ({
            data: prevState.data.map(
                data => data.id === num ? changes : data
            )
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
            this.itemFirstname.focus();
        } else {
            this.props.importPreStudent(this.state.data, this.itemDivision.value(), data => {
                if (data.error) {
                    T.notify('Import ứng viên bị lỗi!', 'danger');
                } else {
                    this.props.history.push('/user/pre-student');
                }
            })
        }
    }

    render() {
        const permission = this.getUserPermission('student', ['read', 'write', 'delete']),
            readOnly = !permission.write;
        const table = renderTable({
            getDataSource: () => this.state.data && this.state.data.length > 0 ? this.state.data : [],
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%' }}>Họ và Tên</th>
                    <th style={{ width: '30%' }}>Email</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số điện thoại</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true' >Loại khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giới tính</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày sinh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Quốc tịch</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nơi cư trú</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nơi đăng ký hộ khẩu thường trú</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số CMND, CCCD</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nơi cấp CMND, CCCD</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày cấp CMND, CCCD</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số giấy phép lái xe 2 bánh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày trúng truyển giấy phép lái xe 2 bánh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'> Nơi cấp giấy phép lái xe 2 bánh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Đã có giấy khám sức khoẻ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày khám sức khoẻ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.firstname + ' ' + item.lastname} />
                    <TableCell type='text' content={item.email} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.mobileDisplay(item.phoneNumber)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.courseType} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.sex} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.birthday, 'dd/mm/yyyy')} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.nationality} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.residence} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.regularResidence} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.identityCard} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.identityIssuedBy} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.identityDate, 'dd/mm/yyyy')} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.giayPhepLaiXe2BanhSo} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.giayPhepLaiXe2BanhNgay} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.giayPhepLaiXe2BanhNoiCap} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.giayKhamSucKhoe} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.giayKhamSucKhoeNgayKham} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.showEditModal} onDelete={this.delete} />
                </tr>),
        });

        const filebox = (
            <div className='tile'>
                <h3 className='tile-title'>Upload danh sách ứng viên</h3>
                <FormFileBox ref={e => this.fileBox = e} label='File excel ứng viên' uploadType='CandidateFile'
                    onSuccess={this.onUploadSuccess} readOnly={readOnly} />
                <a href='/download/Candidate.xlsx' style={{ float: 'right' }}><i className='fa-fw fa-lg fa fa-download' /> Tải xuống file mẫu</a>
            </div>
        );
        const list = (
            <div>
                <div className='tile'>
                    <h3 className='tile-title'>Chọn cơ sở</h3>
                    <FormSelect ref={e => this.itemDivision = e} className='col-md-4' data={ajaxSelectDivision} readOnly={readOnly} />
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
