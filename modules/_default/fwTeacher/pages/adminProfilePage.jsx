import React from 'react';
import { connect } from 'react-redux';
import { getTeacherProfileAll,createTeacherProfile,updateTeacherProfile,deleteTeacherProfile } from '../redux';
import { AdminPage, FormTextBox, FormSelect, AdminModal, renderTable,TableCell,CirclePageButton,FormCheckbox } from 'view/component/AdminPage';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';

class CertificationModal extends AdminModal {
    state = {};
    onShow = (item) => {
        const { _id, category=null,totNghiepChuyenMon=false,soLuong=''} = item||{};
        this.itemLoaiHoSo.value(category? category._id : null);
        this.itemTotNghiepChuyenMon.value(totNghiepChuyenMon||'');
        this.itemSoLuong.value(soLuong || '');
        this.setState({ _id,totNghiepChuyenMon });
    }

    onSubmit = () => {
        const data = {
            category: this.itemLoaiHoSo.value(),
            totNghiepChuyenMon:this.itemTotNghiepChuyenMon.value()?1:0,
            soLuong:this.itemTotNghiepChuyenMon.value()?'':this.itemSoLuong.value(),
            teacher:this.props.teacher,
        };
        if (!data.category) {
            T.notify('loại chứng chỉ không được trống!', 'danger');
            this.itemLoaiHoSo.focus();
        } else if (!data.totNghiepChuyenMon && data.soLuong == '') {
            T.notify('Số lượng không được trống!', 'danger');
            this.itemSoLuong.focus();
        }else {
            this.state._id ?this.props.update(this.state._id,data,()=>{
                this.hide();
                this.props.reload({});
            }):this.props.create(data,()=>{
                this.hide();
                this.props.reload({});
            });
        }
    }

    addSoLuongGiayTo = e => {
        e.preventDefault();
        const newItem = {
            id: T.randomPassword(),
            soLuongGiayTo: this.itemSoLuongGiayTo.value(),
            loaiGiayTo: this.itemLoaiGiayTo.value(),
        };
        if (newItem.soLuongGiayTo === '' || newItem.soLuongGiayTo == null) {
            T.notify('Số lượng giấy tờ không được trống!', 'danger');
            this.itemSoLuongGiayTo.focus();
        } else if (newItem.loaiGiayTo === '' || newItem.loaiGiayTo == null) {
            T.notify('Tín chỉ nhiều nhất không được trống!', 'danger');
            this.itemLoaiGiayTo.focus();
        }else {
            this.setState(previousState => ({ amount: [...previousState.amount  , newItem] }));
            this.itemSoLuongGiayTo.value('');
            this.itemLoaiGiayTo.value('');
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Chứng chỉ',
            size: 'medium',
            body: 
            <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.itemLoaiHoSo = e} label='Loại hồ sơ' data={this.props.profiles} readOnly={readOnly} required />
                <FormCheckbox className='col-md-12' ref={e => this.itemTotNghiepChuyenMon = e} label='Tốt nghiệp chuyên môn' readOnly={readOnly} onChange = {value=>this.setState({totNghiepChuyenMon:value})}/>
                <div className='col-md-12' style={{display:this.state.totNghiepChuyenMon?'none':'block'}}>
                    <FormTextBox ref={e => this.itemSoLuong = e} label='Số lượng' readOnly={readOnly} />
                </div>

                {/* <div className='col-md-12' style={{display:this.state.totNghiepChuyenMon?'none':'flex',paddingLeft: 15, paddingRight: 15}}>
                    <FormTextBox ref={e => this.itemSoLuong = e} label='Số lượng' readOnly={readOnly} />
                    <FormTextBox type='number' ref={e => this.itemSoLuongGiayTo = e} label='Số lượng' style={{ flex:'auto', paddingRight: 8 }} />
                    <FormTextBox type='Loại giấy tờ' ref={e => this.itemLoaiGiayTo = e} label='Loại giấy tờ' style={{flex:'auto', paddingRight: 8 }} />
                    <div style={{flex:'auto', textAlign: 'center',marginTop:28 }}>
                        <button className='btn btn-success' onClick={e => this.addSoLuongGiayTo(e)} style={{ marginBottom: '-1rem' }}><i className='fa fa-lg fa-plus m-0' /></button>
                    </div>
                </div> */}
            </div >
        });
    }
}


class TeacherInfoPage extends AdminPage {
    state = {stateChuyenMon:'dangKiemTra',profiles:[]};
    componentDidMount() {
        T.ready('/user/teacher', () => {
            const route = T.routeMatcher('/user/teacher/:_id'), params = route.parse(window.location.pathname);
            if(params && params._id){
                // chứng chỉ
                this.props.getCategoryAll('profile',null,items=>{
                    this.setState({ _teacherId:params._id,profiles: (items || []).map(item => ({ id: item._id, text: item.title })) });
                });
                this.onSearch({_teacherId:params._id});
                
            }else{
                this.props.history.push('/user/teacher');   
            }
        });
    }

    onSearch = ({_teacherId})=>{
        this.props.getTeacherProfileAll({teacher:_teacherId?_teacherId:this.state._teacherId});
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    deleteProfile = (e, item) => e.preventDefault() || T.confirm('Hồ sơ giáo viên', 'Bạn có chắc bạn muốn xoá hồ sơ này không?', 'warning', true, isConfirm =>
        isConfirm && this.props.deleteTeacherProfile(item._id, ()=>this.onSearch({})));

    updateState = (item, state) =>{
        // if(state!='khongHopLe'){
        //     this.props.updateTeacherProfile(item._id, { state },()=>this.onSearch({}));
        // }else{
        //     this.inVaildModal.show(data=>this.props.updateTeacherProfile(item._id, { state,...data },()=>this.onSearch({})));
        // }
        this.props.updateTeacherProfile(item._id, { state },()=>this.onSearch({}));
    }

    // save data

    render() {
        const permission = this.props.permission;
        const teacherProfiles = this.props.teacher && this.props.teacher.listProfile&& this.props.teacher.listProfile.length ? this.props.teacher.listProfile:[];
        const tableProfile = renderTable({
            getDataSource: () => teacherProfiles,
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại hồ sơ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tốt nghiệp chuyên môn</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lượng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                return(
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell type='text' content={item.category ?item.category.title : '_'} />
                        <TableCell type='checkbox' permission={permission} content={item.totNghiepChuyenMon} onChanged = {value=>this.props.updateTeacherProfile(item._id,{totNghiepChuyenMon:value},()=>this.onSearch({}))}/>
                        <TableCell type='text' content={item.totNghiepChuyenMon?'':item.soLuong}  style={{ whiteSpace: 'nowrap' }}  />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={e=>this.edit(e,item)} onDelete={this.deleteProfile} />
                    </tr>
                );
            }
                
        });
        return<>
                <div className='tile'>
                    <div className="tile-body">
                        <div className='row'>
                            <div className="col-12">
                                {tableProfile}
                            </div>
                        </div>
                    </div>
                </div>
                {permission.write ? <CirclePageButton type='create' onClick={this.edit} /> : null}
                <CertificationModal ref={e => this.modal = e} readOnly={!permission.write} profiles={this.state.profiles}
                    create={this.props.createTeacherProfile} update={this.props.updateTeacherProfile} teacher = {this.state._teacherId} reload = {this.onSearch}/>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system,teacher:state.enrollment.teacher });
const mapActionsToProps = {  getCategoryAll,getTeacherProfileAll,createTeacherProfile,updateTeacherProfile,deleteTeacherProfile};
export default connect(mapStateToProps, mapActionsToProps)(TeacherInfoPage);