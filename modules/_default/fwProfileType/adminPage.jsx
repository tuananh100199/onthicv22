import React from 'react';
import { connect } from 'react-redux';
import { createProfileType,updateProfileType,deleteProfileType,getProfileTypePage } from './redux';
import { AdminPage, AdminModal, FormCheckbox, FormTextBox, TableCell, renderTable,FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {getProfileStudentTypeAll} from 'modules/mdDaoTao/fwProfileStudentType/redux';
class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const { _id=null, title='',active=true,profiles=[] } = item || {};
        this.itemTitle.value(title);
        this.itemActive.value(active);
        this.itemProfileAmount.value(1);
        this.itemProfileRequired.value(true);
        this.setState({ _id,profiles });
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value(),
            active: this.itemActive.value()?1:0,
            profiles:this.state.profiles
        };
        if (data.title == '') {
            T.notify('Tên loại hồ sơ bị trống!', 'danger');
            this.itemTitle.focus();
        }else {
            this.state._id ? this.props.update(this.state._id, data, this.hide) : this.props.create(data, this.hide);
        }
    }

    addProfile = (e)=>{
        e.preventDefault();
        const { profileStudentTypes }= this.props;
        const _profileId = this.itemProfileType.value(),
        amount = this.itemProfileAmount.value(),
        required = this.itemProfileRequired.value()?1:0;
        if(!_profileId){
            T.notify('Chưa chọn loại hồ sơ!', 'danger');
            this.itemProfileType.focus();
        }else if(this.state.profiles.find(profile=>profile.type && profile.type._id==_profileId)){
            T.notify('Loại hồ sơ đã tồn tại!', 'danger');
            this.itemProfileType.focus();
        }else if(!amount){
            T.notify('Chưa điền số lượng', 'danger');
            this.itemProfileAmount.focus();
        }else{
            const profile = profileStudentTypes.find(item=>item._id==_profileId);
            const data = {
                type:profile,
                amount,
                required
            };
            this.setState(prev=>({profiles:[...prev.profiles,data]}),()=>{
                this.itemProfileType.value('');
                this.itemProfileAmount.value(1);
                this.itemProfileRequired.value(true);
                
            });
        }
    }

    removeProfile = (e,type)=>{
        e.preventDefault();
        this.setState(prev=>({profiles:prev.profiles.filter(profile=>profile.type._id!=type._id)}));
    }

    render = () => {
        const readOnly = this.props.readOnly;
        const { profileStudentTypes }= this.props;
        const profileOptions = profileStudentTypes.map(profile=>({id:profile._id,text:profile.title}));
        return this.renderModal({
            title: 'Loại hồ sơ',
            size: 'large',
            body: <div className='row'>
                <FormTextBox ref={e => this.itemTitle = e} className='col-md-12' label='Tên' readOnly={readOnly} required/>
                <FormCheckbox ref={e => this.itemActive = e} className='col-md-6' label='Kích hoạt' readOnly={readOnly} />
                <div className='col-md-12'>
                    <h5>Giấy tờ kèm theo</h5>
                    <ul className='menuList' style={{ display: this.state.profiles && this.state.profiles.length > 0 ? 'block' : 'none', paddingLeft: 15 }}>
                        {this.state.profiles && this.state.profiles.map((item, index) =>
                            <li key={index}>
                                <div style={{ display: 'inline-flex' }}>
                                    <label style={{ display: 'block' }}>{item.amount} {item.type.title} {!item.required?'(Không bắt buộc)':''}</label>
                                    <div className='buttons'>
                                        <a className='text-danger' href='#' onClick={e => this.removeProfile(e, item.type)}><i className='fa fa-lg fa-times' /></a>
                                    </div>
                                </div>
                            </li>)}
                    </ul>
                </div>

                <FormSelect ref={e => this.itemProfileType = e} className='col-md-6' label='Giấy tờ' data={profileOptions} readOnly={readOnly}/>
                <FormTextBox type='number' ref={e => this.itemProfileAmount = e} className='col-md-3' label='Số lượng' readOnly={readOnly}/>
                <div className="col-md-2 d-flex align-items-center">
                    <FormCheckbox ref={e => this.itemProfileRequired = e} label='bắt buộc' isSwitch={true}  readOnly={readOnly} />
                </div>
                <div className="col-md-1 d-flex align-items-center">
                    <button className='btn btn-success' onClick={e=>this.addProfile(e)} style={{ marginBottom: '-1rem' }}><i className='fa fa-lg fa-plus m-0' /></button>
                </div>
            </div>
        });
    }
}

class ProfileTypePage extends AdminPage {
    state = { };
    componentDidMount() {
        T.ready(() => {
            T.showSearchBox();
            this.props.getProfileTypePage(1);
            T.onSearch = (searchText) => this.props.getProfileTypePage(1,undefined,searchText);
            this.props.getProfileStudentTypeAll('');
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    
    delete = (e, item) => e.preventDefault() || T.confirm('Xóa loại hồ sơ', 'Bạn có chắc bạn muốn xóa loại giấy tờ này?', true, isConfirm =>
        isConfirm && this.props.deleteProfileType(item._id));

    renderListPapers = papers=>(<>
            {papers.map((paper,index)=><p style={{marginBottom:0}} key={index}> - {paper?paper.amount:''} {paper.type ? paper.type.title:''} {!paper.required?'(Nếu có)':''}</p>)}
        </>)

    render() {
        const permission = this.getUserPermission('profileType');
        const { pageNumber, pageSize, pageTotal, totalItem,list } = this.props.profileType && this.props.profileType.page ?
        this.props.profileType.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const profileStudentTypes = this.props.profileStudentType && this.props.profileStudentType.list ? this.props.profileStudentType.list:[];
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%'}}>Loại hồ sơ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giấy tờ liên quan</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize+ index + 1} />
                    <TableCell type='link' content={item.title} style={{whiteSpace:'nowrap'}} onClick={e => this.edit(e, item)}/>
                    <TableCell content={item.profiles && item.profiles.length ? this.renderListPapers(item.profiles):''} style={{whiteSpace:'nowrap'}}/>
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateProfileType(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Hồ sơ đăng ký',
            breadcrumb: ['Hồ sơ đăng ký'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageProfileType' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getProfileTypePage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} profileStudentTypes={profileStudentTypes}
                    create={this.props.createProfileType} update={this.props.updateProfileType} />
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, profileType: state.enrollment.profileType, profileStudentType: state.enrollment.profileStudentType });
const mapActionsToProps = { getProfileTypePage,createProfileType,updateProfileType,deleteProfileType, getProfileStudentTypeAll };
export default connect(mapStateToProps, mapActionsToProps)(ProfileTypePage);