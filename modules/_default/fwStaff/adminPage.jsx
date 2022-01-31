import React from 'react';
import { connect } from 'react-redux';
import { getStaffInfoPage,createStaffInfo,updateStaffInfo,deleteStaffInfo } from './redux';
import { AdminPage, AdminModal,FormDatePicker,FormSelect, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { ajaxSelectDivision,getDivisionAll } from 'modules/mdDaoTao/fwDivision/redux';
import { ajaxSelectDepartment } from 'modules/_default/fwDepartment/redux';

class StaffInfoModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLastname.focus()));
    }

    onShow = (item) => {
        const { _id, firstname, lastname, birthday,email,phoneNumber, sex, division, identityCard,department,msnv,chucVu} = item || 
        {_id:null,firstname:'',lastname:'',birthday:'',email:'',phoneNumber:'',sex:null,division:null,identityCard:'',department:null,msnv:'',chucVu:''};
        this.itemFirstname.value(firstname || '');
        this.itemLastname.value(lastname || '');
        this.itemBirthday.value(birthday);
        this.itemEmail.value(email || '');
        this.itemPhoneNumber.value(phoneNumber || '');
        this.itemIdentityCard.value(identityCard || '');
        this.itemSex.value(sex ? sex : 'male');
        this.itemDivision.value(division ? { id: division._id, text: division.title } : null);
        this.itemDepartment.value(department?{id:department._id,text:department.title}:null);
        this.itemMsnv.value(msnv||'');
        this.itemChucVu.value(chucVu||'');
        this.setState({ _id });
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
            sex: this.itemSex.value(),
            division: this.itemDivision.value(),
            department: this.itemDepartment.value(),
            msnv: this.itemMsnv.value().toUpperCase(),
            chucVu:this.itemChucVu.value(),
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
        }else {
            this.props.create(data,data=>{
                this.hide();
                this.props.history.push('/user/staff-info/' + data.item._id);
            });
        }
    }

    // eslint-disable-next-line no-unused-vars

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Nhân viên',
            size: 'large',
            body: 
            <div className='row'>
                <FormTextBox className='col-md-8' ref={e => this.itemLastname = e} label='Họ & tên đệm' readOnly={readOnly} required />
                <FormTextBox className='col-md-4' ref={e => this.itemFirstname = e} label='Tên' readOnly={readOnly} required />
                <FormTextBox className='col-md-12' ref={e => this.itemEmail = e} label='Email' readOnly={readOnly} type='email' />
                <FormSelect className='col-md-6' ref={e => this.itemSex = e} label='Giới tính' data={[{ id: 'female', text: 'Nữ' }, { id: 'male', text: 'Nam' }]} readOnly={readOnly} />
                <FormDatePicker className='col-md-6' ref={e => this.itemBirthday = e} label='Ngày sinh' readOnly={readOnly} type='date-mask' required />
                <FormTextBox className='col-md-6' type='phone' ref={e => this.itemPhoneNumber = e} readOnly={readOnly} label='Số điện thoại' required />
                <FormTextBox className='col-md-6' ref={e => this.itemIdentityCard = e} label='CMND/CCCD' readOnly={readOnly} required />
                <FormSelect className='col-md-6' ref={e => this.itemDivision = e} label='Cơ sở đào tạo' data={ajaxSelectDivision} readOnly={readOnly} required />
                <FormSelect className='col-md-6' ref={e => this.itemDepartment = e} label='Phòng ban' data={ajaxSelectDepartment} readOnly={readOnly} required />
                <FormTextBox className='col-md-6' ref={e => this.itemChucVu = e} label='Chức vụ' readOnly={readOnly}/>
                <FormTextBox className='col-md-6' ref={e => this.itemMsnv = e} label='Mã số nhân viên' readOnly={readOnly}/>
            </div >
        });
    }
}

class AdminStaffInfoPage extends AdminPage {
    state = { filterDivisionData:[{id:'all',text:'Tất cả'}],filterDivision:'all',searchText:'',isOutside:false };
    componentDidMount() {
        T.ready(() => {
            T.showSearchBox();
            this.props.getStaffInfoPage(1);

            const isOutside = this.props.system && this.props.system.user && this.props.system.user.division 
            && this.props.system.user.division.isOutside ? this.props.system.user.division.isOutside:false;
            
            //get data division
            !isOutside && this.props.getDivisionAll(list=>{
                const divisionData = list.map(division=>({id:division._id,text:division.title}));
                this.setState({filterDivisionData:[...this.state.filterDivisionData,...divisionData]},()=>{
                    this.filterDivision.value(this.state.filterDivision);
                });
            });

            T.onSearch = (searchText) =>{
                this.props.getStaffInfoPage(1,undefined,{searchText,filterDivision:this.state.filterDivision},()=>{
                    this.setState({searchText});
                });
            }; 
        });
    }

    onSearch = ({ pageNumber, pageSize, searchText, filterDivision }, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        if (filterDivision == undefined) filterDivision = this.state.filterDivision;
        const condition = { searchText, filterDivision };
        this.props.getStaffInfoPage(pageNumber,pageSize,condition,page=>{
            done && done(page);
            this.setState({searchText,filterDivision});
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    
    delete = (e, item) => e.preventDefault() || T.confirm('Xóa nhân viên', 'Bạn có chắc bạn muốn xóa nhân viên này?', true, isConfirm =>
        isConfirm && this.props.deleteStaffInfo(item._id));

    render() {
        const permission = this.getUserPermission('staff-info');
        const { pageNumber, pageSize, pageTotal, totalItem,list } = this.props.staffInfo && this.props.staffInfo.page ?
        this.props.staffInfo.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0,list:null };
        const isOutside = this.props.system && this.props.system.user && this.props.system.user.division 
            && this.props.system.user.division.isOutside ? this.props.system.user.division.isOutside:false;
    
        const header = !isOutside?<>
            <label style={{ lineHeight: '40px', marginBottom: 0 }}>Cơ sở đào tạo:</label>&nbsp;&nbsp;
            <FormSelect ref={e => this.filterDivision = e} data={this.state.filterDivisionData} onChange={value => this.onSearch({ filterDivision: value.id })} style={{ minWidth: '200px', marginBottom: 0, marginRight: 12 }} />
        </>:null;
        const table = renderTable({
            getDataSource: () => list,
            stickyHead:true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Họ tên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thông tin liên lạc</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Cơ sở đào tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Phòng ban</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Chức vụ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>MSNV</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize+ index + 1} />
                    <TableCell type='link' content={<>{item.lastname} {item.firstname}<br />{item.identityCard}</>} url={'/user/staff-info/' + item._id} />
                    <TableCell  content={<>{item.email}<br />{item.phoneNumber}</>} />
                    <TableCell  style={{whiteSpace:'nowrap'}} content={item.division? item.division.title:''} />
                    <TableCell  style={{whiteSpace:'nowrap'}} content={item.department?item.department.title:''} />
                    <TableCell  style={{whiteSpace:'nowrap'}} content={item.chucVu} />
                    <TableCell  style={{whiteSpace:'nowrap'}} content={item.msnv} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/staff-info/' + item._id} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Nhân viên',
            breadcrumb: ['Nhân viên'],
            header:header,
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageStaffInfo' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getStaffInfoPage} />
                <StaffInfoModal ref={e => this.modal = e} readOnly={!permission.write} history={this.props.history}
                    create={this.props.createStaffInfo} update={this.props.updateStaffInfo} />
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, staffInfo: state.framework.staffInfo });
const mapActionsToProps = { getStaffInfoPage,createStaffInfo,updateStaffInfo,deleteStaffInfo,getDivisionAll };
export default connect(mapStateToProps, mapActionsToProps)(AdminStaffInfoPage);