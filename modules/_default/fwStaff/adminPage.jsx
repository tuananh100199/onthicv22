import React from 'react';
import { connect } from 'react-redux';
import { getStaffInfoPage,createStaffInfo,updateStaffInfo,deleteStaffInfo } from './redux';
import { AdminPage, AdminModal,FormDatePicker,FormImageBox, FormRichTextBox,FormSelect, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';
import { ajaxSelectDepartment } from 'modules/_default/fwDepartment/redux';

class StaffInfoModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLastname.focus()));
    }

    onShow = (item) => {
        const { _id,image, firstname, lastname, birthday,email,phoneNumber, sex, division, identityCard,identityDate,identityIssuedBy,department,
        msnv,chucVu,ngayBatDauLam,trinhDoDaoTao,trinhDoHocVan,chuyenNganh,truongDaoTao,bangCapKhac,residence,regularResidence } = item || 
        {_id:null,image:'',firstname:'',lastname:'',birthday:'',email:'',phoneNumber:'',user:null,sex:null,division:null,identityCard:'',identityDate:'',identityIssuedBy:'',department:'',
    msnv:'',chucVu:'',ngayBatDauLam:'',trinhDoDaoTao:'',trinhDoHocVan:'',chuyenNganh:'',truongDaoTao:'',bangCapKhac:'',residence:'',regularResidence:''};
        this.itemFirstname.value(firstname || '');
        this.itemLastname.value(lastname || '');
        this.itemBirthday.value(birthday);
        this.itemEmail.value(email || '');
        this.itemPhoneNumber.value(phoneNumber || '');
        this.itemIdentityCard.value(identityCard || '');
        this.itemIdentityDate.value(identityDate || '');
        this.itemIdentityIssuedBy.value(identityIssuedBy || '');
        this.itemSex.value(sex ? sex : 'male');
        this.itemDivision.value(division ? { id: division._id, text: division.title } : null);
        this.itemDepartment.value(department?{id:department._id,text:department.title}:null);
        this.itemMsnv.value(msnv||'');
        this.itemChucVu.value(chucVu||'');
        this.itemNgayBatDauLam.value(ngayBatDauLam||'');
        this.itemTrinhDoDaoTao.value(trinhDoDaoTao||'');
        this.itemTrinhDoHocVan.value(trinhDoHocVan||'');
        this.itemChuyenNganh.value(chuyenNganh||'');
        this.itemTruongDaoTao.value(truongDaoTao||'');
        this.itemBangCapKhac.value(bangCapKhac||'');
        this.itemResidence.value(residence||'');
        this.itemRegularResidence.value(regularResidence||'');
        this.imageBox.setData(`staffInfo:${_id || 'new'}`);
        this.setState({ _id, divisionId: division && division._id,image }, () => {
        });
    }

    onUploadSuccess = ({ error, image }) => {
        if (error) {
            T.notify('Upload hình ảnh thất bại!', 'danger');
        } else {
            image && this.setState({ image });
        }
    }

    onSubmit = () => {
        const data = {
            firstname: this.itemFirstname.value(),
            lastname: this.itemLastname.value(),
            birthday: this.itemBirthday.value(),
            email: this.itemEmail.value(),
            phoneNumber: this.itemPhoneNumber.value(),
            identityCard: this.itemIdentityCard.value(),
            identityDate:this.itemIdentityDate.value(),
            identityIssuedBy:this.itemIdentityIssuedBy.value(),
            sex: this.itemSex.value(),
            division: this.itemDivision.value(),
            department: this.itemDepartment.value(),
            msnv: this.itemMsnv.value(),
            chucVu:this.itemChucVu.value(),
            ngayBatDauLam:this.itemNgayBatDauLam.value(),
            trinhDoDaoTao:this.itemTrinhDoDaoTao.value(),
            trinhDoHocVan:this.itemTrinhDoHocVan.value(),
            chuyenNganh:this.itemChuyenNganh.value(),
            truongDaoTao:this.itemTruongDaoTao.value(),
            bangCapKhac:this.itemBangCapKhac.value(),
            residence:this.itemResidence.value(),
            regularResidence:this.itemResidence.value(),
            image:this.state.image
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
        } else if (data.identityCard == '') {
            T.notify('Số CMND/CCCD không được trống!', 'danger');
            this.itemIdentityCard.focus();
        } else if (data.birthday == '') {
            T.notify('Ngày sinh người dùng bị trống!', 'danger');
            this.itemBirthday.focus();
        } else if (!data.division) {
            T.notify('Cơ sở đào tạo không được trống!', 'danger');
            this.itemDivision.focus();
        } else if (!data.department) {
            T.notify('Phòng ban không được trống!', 'danger');
            this.itemDepartment.focus();
        } else if (!data.chucVu) {
            T.notify('Chức vụ không được trống!', 'danger');
            this.itemChucVu.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data, this.hide()) : this.props.create(data, this.hide);
        }
    }

    // eslint-disable-next-line no-unused-vars

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Nhân viên',
            size: 'extra-large',
            body: 
            <div className='row'>
                <div className='col-md-9'>
                    <div className='row'>
                        <FormTextBox className='col-md-4' ref={e => this.itemLastname = e} label='Họ & tên đệm' readOnly={readOnly} required />
                        <FormTextBox className='col-md-4' ref={e => this.itemFirstname = e} label='Tên' readOnly={readOnly} required />
                        <FormSelect className='col-md-4' ref={e => this.itemSex = e} label='Giới tính' data={[{ id: 'female', text: 'Nữ' }, { id: 'male', text: 'Nam' }]} readOnly={readOnly} />
                        <FormDatePicker className='col-md-4' ref={e => this.itemBirthday = e} label='Ngày sinh' readOnly={readOnly} type='date-mask' required />
                        <FormTextBox className='col-md-4' ref={e => this.itemEmail = e} label='Email' readOnly={readOnly} type='email' />
                        <FormTextBox className='col-md-4' type='phone' ref={e => this.itemPhoneNumber = e} readOnly={readOnly} label='Số điện thoại' required />
                    </div>
                    
                </div>
                <FormImageBox ref={e => this.imageBox = e} className='col-md-3' label='Hình đại diện' uploadType='StaffInfoImage' image={this.state.image} readOnly={readOnly}
                    onSuccess={this.onUploadSuccess} />
                <FormTextBox className='col-md-3' ref={e => this.itemIdentityCard = e} label='CMND/CCCD' readOnly={readOnly} required />
                <FormDatePicker className='col-md-3' ref={e => this.itemIdentityDate = e} label='Ngày cấp CMND/CCCD' type='date-mask' readOnly={readOnly} />
                <FormTextBox className='col-md-6' ref={e => this.itemIdentityIssuedBy = e} label='Nơi cấp CMND/CCCD' readOnly={readOnly} />
                <FormSelect className='col-md-3' ref={e => this.itemDivision = e} label='Cơ sở đào tạo' data={ajaxSelectDivision} readOnly={readOnly} required />
                <FormSelect className='col-md-3' ref={e => this.itemDepartment = e} label='Phòng ban' data={ajaxSelectDepartment} readOnly={readOnly} required />
                <FormTextBox className='col-md-3' ref={e => this.itemChucVu = e} label='Chức vụ' required readOnly={readOnly}/>
                <FormTextBox className='col-md-3' ref={e => this.itemMsnv = e} label='Mã số nhân viên' readOnly={readOnly}/>
                <FormDatePicker className='col-md-3' ref={e => this.itemNgayBatDauLam = e} label='Ngày bắt đầu làm'readOnly={readOnly} type='date-mask'/>
                <FormTextBox className='col-md-3' ref={e => this.itemTrinhDoDaoTao = e} label='Trình độ đào tạo'readOnly={readOnly}/>
                <FormTextBox className='col-md-3' ref={e => this.itemTrinhDoHocVan = e} label='Trình độ học vấn'readOnly={readOnly}/>
                <FormTextBox className='col-md-3' ref={e => this.itemChuyenNganh = e} label='Chuyên ngành'readOnly={readOnly}/>
                <FormTextBox className='col-md-6' ref={e => this.itemTruongDaoTao = e} label='Trường đào tạo'readOnly={readOnly}/>
                <FormTextBox className='col-md-6' ref={e => this.itemBangCapKhac = e} label='Bằng cấp khác' readOnly={readOnly}/>
                <FormRichTextBox ref={e => this.itemResidence = e} className='col-md-6' label='Nơi cư trú' readOnly={readOnly} rows='2' />
                <FormRichTextBox ref={e => this.itemRegularResidence = e} className='col-md-6' label='Nơi đăng ký hộ khẩu thường trú' readOnly={readOnly} rows='2' />
            </div >
        });
    }
}

class AdminStaffInfoPage extends AdminPage {
    state = { };
    componentDidMount() {
        T.ready(() => {
            T.showSearchBox();
            this.props.getStaffInfoPage(1);
            T.onSearch = (searchText) => this.props.getStaffInfoPage(1,undefined,{searchText});
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    delete = (e, item) => e.preventDefault() || T.confirm('Xóa nhân viên', 'Bạn có chắc bạn muốn xóa nhân viên này?', true, isConfirm =>
        isConfirm && this.props.deleteStaffInfo(item._id));

    render() {
        const permission = this.getUserPermission('staff-info');
        const { pageNumber, pageSize, pageTotal, totalItem,list } = this.props.staffInfo && this.props.staffInfo.page ?
        this.props.staffInfo.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0,list:[] };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Họ tên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thông tin liên lạc</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Cơ sở đào tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Phòng ban</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Chức vụ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize+ index + 1} />
                    <TableCell type='link' content={<>{item.lastname} {item.firstname}<br />{item.identityCard}</>} onClick={e => this.edit(e, item)} />
                    <TableCell  content={item.phoneNumber||item.email||item.user?.phoneNumber||item.user?.email||''} />
                    <TableCell  style={{whiteSpace:'nowrap'}} content={item.division? item.division.title:''} />
                    <TableCell  style={{whiteSpace:'nowrap'}} content={item.department?item.department.title:''} />
                    <TableCell  style={{whiteSpace:'nowrap'}} content={item.chucVu} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Nhân viên',
            breadcrumb: ['Nhân viên'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageStaffInfo' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getStaffInfoPage} />
                <StaffInfoModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createStaffInfo} update={this.props.updateStaffInfo} />
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, staffInfo: state.framework.staffInfo });
const mapActionsToProps = { getStaffInfoPage,createStaffInfo,updateStaffInfo,deleteStaffInfo };
export default connect(mapStateToProps, mapActionsToProps)(AdminStaffInfoPage);