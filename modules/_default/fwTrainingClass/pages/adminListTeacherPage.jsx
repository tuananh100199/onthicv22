import React from 'react';
import { connect } from 'react-redux';
import { updateTrainingClass,getTrainingClass } from '../redux';
import { AdminPage, FormTextBox, FormSelect, AdminModal, renderTable,TableCell,CirclePageButton,FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
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

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Đề xuất giáo viên',
            size: 'medium',
            body: 
            <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.itemLoaiHoSo = e} label='Loại hồ sơ' data={this.props.profiles} readOnly={readOnly} required />
                <FormCheckbox className='col-md-12' ref={e => this.itemTotNghiepChuyenMon = e} label='Tốt nghiệp chuyên môn' readOnly={readOnly} onChange = {value=>this.setState({totNghiepChuyenMon:value})}/>
                <div className='col-md-12' style={{display:this.state.totNghiepChuyenMon?'none':'block'}}>
                    <FormTextBox ref={e => this.itemSoLuong = e} label='Số lượng' readOnly={readOnly} />
                </div>
            </div >
        });
    }
}


class ListTeacherPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/training-class', () => {
            const route = T.routeMatcher('/user/training-class/:_id'), params = route.parse(window.location.pathname);
            if(params && params._id){
                this.props.getTrainingClass(params._id,()=>this.setState({_id:params._id}));                
            }else{
                this.props.history.push('/user/training-class');   
            }
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    delete = (e, item) => e.preventDefault() || T.confirm('Hồ sơ giáo viên', 'Bạn có chắc bạn muốn xoá hồ sơ này không?', 'warning', true, isConfirm =>
        isConfirm && this.props.updateTrainingClass(item._id));

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
                        <TableCell type='checkbox' permission={permission} content={item.totNghiepChuyenMon} onChanged = {value=>this.props.updateTrainingClass(item._id,{totNghiepChuyenMon:value},()=>this.onSearch({}))}/>
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
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} profiles={this.state.profiles}
                    create={this.props.updateTrainingClass} update={this.props.updateTrainingClass} teacher = {this.state._teacherId} reload = {this.onSearch}/>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system,trainingClass:state.enrollment.trainingClass });
const mapActionsToProps = {updateTrainingClass,getTrainingClass};
export default connect(mapStateToProps, mapActionsToProps)(ListTeacherPage);