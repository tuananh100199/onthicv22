import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, AdminModal, FormFileBox, FormTextBox, FormSelect, TableCell, renderTable, CirclePageButton } from 'view/component/AdminPage';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';
import { Link } from 'react-router-dom';

class EditModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemFirstname.focus()));
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
            licenseNumber,
            licenseDate,
            licenseIssuedBy,
            giaykhamsuckhoe,
            cogiaykhamsuckhoe } = item ||
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
                licenseNumber: '',
                licenseDate: '',
                licenseIssuedBy: '',
                giaykhamsuckhoe: '',
                cogiaykhamsuckhoe: ''
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
        this.itemLincenseNumber.value(licenseNumber);
        this.itemLincenseDate.value(licenseDate);
        this.itemLincenseIssuedBy.value(licenseIssuedBy);
        this.itemGiayKhamSucKhoe.value(giaykhamsuckhoe);
        this.itemCoGiayKhamSucKhoe.value(cogiaykhamsuckhoe);
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
            licenseNumber: this.itemLincenseNumber.value(),
            licenseDate: this.itemLincenseDate.value(),
            licenseIssuedBy: this.itemLincenseIssuedBy.value(),
            giaykhamsuckhoe: this.itemGiayKhamSucKhoe.value(),
            cogiaykhamsuckhoe: this.itemCoGiayKhamSucKhoe.value(),
        };
        if (data.firstname == '') {
            T.notify('Tên ứng viên bị trống!', 'danger');
            this.itemFirstname.focus();
        } else if (data.lastname == '') {
            T.notify('Tên ứng viên bị trống!', 'danger');
            this.itemLastname.focus();
        } else if (data.email == '') {
            T.notify('Email ứng viên bị trống!', 'danger');
            this.itemEmail.focus();
        } else if (data.phoneNumber == '') {
            T.notify('Số điện thoại ứng viên bị trống!', 'danger');
            this.itemPhoneNumber.focus();
        } else if (data.courseType == '') {
            T.notify('Hạng đăng ký của ứng viên bị trống!', 'danger');
            this.itemCourseType.focus();
        } else {
            this.props.edit(this.state.num, data)
            this.hide();
        }
    }

    render = () => this.renderModal({
        title: 'Chỉnh sửa ứng viên',
        size: 'large',
        body: (
            <div className='row'>
                <div className='col-md-8'>
                    <FormTextBox ref={e => this.itemFirstname = e} label='Họ ứng viên' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemLastname = e} label='Tên ứng viên' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemEmail = e} label='Email' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemPhoneNumber = e} label='Số điện thoại' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemCourseType = e} label='Hạng đăng ký' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemSex = e} label='Giới tính' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemBirthday = e} label='Năm sinh' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemNationality = e} label='Quốc tịch' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemResidence = e} label='Nơi cư trú' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemRegularResidence = e} label='Nơi đăng ký hộ khẩu thường trú' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemIdentityCard = e} label='Số CMND,CCCD' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemIdentityDate = e} label='Ngày cấp' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemIdentityIssuedBy = e} label='Nơi cấp' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemLincenseNumber = e} label='Số giấy phép lái xe 2 bánh' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemLincenseDate = e} label='Ngày trúng tuyển' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemLincenseIssuedBy = e} label='Nơi cấp' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemGiayKhamSucKhoe = e} label='Đã có giấy phép lái xe' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemCoGiayKhamSucKhoe = e} label='Ngày khám sức khỏe' readOnly={this.props.readOnly} />
                </div>
            </div>),
    });
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
    delete = (e, item) =>
        e.preventDefault() || T.confirm('Xóa thông tin ứng viên', `Bạn có chắc bạn muốn xóa thông tin ứng viên <strong>${item.firstname + ' ' + item.lastname}</strong>?`, true, isConfirm =>
            isConfirm && this.setState(prevState => ({
                data: prevState.data.filter(data => data.id !== item.id)
            }))
        );
    save = () => {
        console.log(this.itemDivision.value())
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
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.identityDate} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.licenseNumber} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.licenseDate} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.licenseIssuedBy} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.giaykhamsuckhoe} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.cogiaykhamsuckhoe} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.showEditModal} onDelete={this.delete} />
                </tr>),
        });
        const filebox = (
            <div className='tile'>
                <h3 className='tile-title'>Upload danh sách ứng viên</h3>
                <FormFileBox ref={e => this.fileBox = e} label='File excel ứng viên' uploadType='CandidateFile'
                    onSuccess={this.onUploadSuccess} readOnly={readOnly} />
                {/* <Link to={'./public/download/Candidate.xlsx'}>
                    Nhấn vào đây để tải xuống file mẫu
                </Link> */}
                <a href='/download/Candidate.xlsx'>Nhấn vào đây để tải xuống file mẫu</a>
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
                <EditModal ref={e => this.modalEdit = e} readOnly={!permission.write} edit={this.edit} />
                <CirclePageButton type='save' onClick={this.save} />
            </div>
        );
        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Ứng viên: ',
            breadcrumb: ['Ứng viên'],
            content: <>
                {filebox}
                {this.state.data && this.state.data.length ? list : null}
            </>,
            backRoute: '/user/pre-student',
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
export default connect(mapStateToProps)(ImportPage);
