import React from 'react';
import { connect } from 'react-redux';
import { updateTrainingClass,getTrainingClass } from '../redux';
import { AdminPage, FormSelect, AdminModal, renderTable,TableCell,CirclePageButton } from 'view/component/AdminPage';
import {ajaxSelectTeacher,getTeacherPage,updateTeacher,updateTeacherTrainingClass} from 'modules/_default/fwTeacher/redux';
import {exportReport} from '../redux';

import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    state = {};
    onShow = () => {
        this.itemTeacher.value(null);
    }

    onSubmit = () => {
        const _id=this.itemTeacher.value();
        if (!_id) {
            T.notify('Giáo viên không được trống!', 'danger');
            this.itemTeacher.focus();
        }{
            this.props.create(_id,this.props.trainingClass,'add',()=>{
                this.hide();
                this.props.getPage(1,null,{trainingClass:this.props.trainingClass});
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
                <FormSelect className='col-md-12' ref={e => this.itemTeacher = e} label='Giáo viên' data={ajaxSelectTeacher({notTrainingClass:this.props.trainingClass})} readOnly={readOnly} required />
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
                this.props.getTeacherPage(1,null,{trainingClass:params._id},()=>this.setState({_id:params._id}));                
            }else{
                this.props.history.push('/user/training-class');   
            }
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    delete = (e, item) => e.preventDefault() || T.confirm('Xóa giáo viên', 'Bạn có chắc bạn muốn xoá giáo viên này khỏi đề xuất tập huấn không?', 'warning', true, isConfirm =>
        isConfirm && this.props.updateTeacherTrainingClass(item._id,this.state._id,'remove',()=>this.props.getTeacherPage(1,null,{trainingClass:this.state._id})));

    // save data
    exportFinal = (e)=>{
        e.preventDefault();
        this.props.exportReport(this.state._id);
    }

    render() {
        const permission = this.props.permission;
        const { pageNumber, pageSize, pageTotal, totalItem,list } = this.props.teacher && this.props.teacher.page ?
        this.props.teacher.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0,list:null };
        const tableProfile = renderTable({
            getDataSource: () =>list,
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên giáo viên</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã giáo viên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                return(
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize+ index + 1} />
                        <TableCell type='text' content={`${item.lastname} ${item.firstname}`} />
                        <TableCell type='text' content={item.maGiaoVien} />
                        <TableCell type='buttons' content={item} permission={permission} onDelete={this.delete} />
                    </tr>
                );
            }
                
        });
        return<>
                <div className='tile'>
                    {tableProfile}
                </div>
                {permission.write ? <CirclePageButton type='create' onClick={this.edit} /> : null}
                <CirclePageButton type='custom' customClassName='btn-warning' customIcon='fa-print' style={{ right: '75px' }} onClick={e=>this.exportFinal(e)}/>
                
                <Pagination name='pageTeacher' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getTeacherPage} style={{ left: 320 }}/>

                <EditModal ref={e => this.modal = e} readOnly={!permission.write} trainingClass={this.state._id}
                 create={this.props.updateTeacherTrainingClass} getPage={this.props.getTeacherPage}/>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system,teacher: state.enrollment.teacher });
const mapActionsToProps = {updateTrainingClass,getTrainingClass,getTeacherPage,updateTeacher,updateTeacherTrainingClass, exportReport};
export default connect(mapStateToProps, mapActionsToProps)(ListTeacherPage);