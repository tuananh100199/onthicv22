import React from 'react';
import { connect } from 'react-redux';
import { ajaxSelectOfficialCourse, getCourseAll,getCourse,updateCourseRole } from 'modules/mdDaoTao/fwCourse/redux';
import { AdminPage, AdminModal, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';
import { ajaxSelectUserType } from 'modules/_default/fwUser/redux';
import {getAssignRolePage} from '../redux';
import { getRoleAll } from 'modules/_default/fwRole/redux';

class AssignRoleModal extends AdminModal {

    onShow = (item) => {
        const {_id=null,user=null} = item||{};
        const course = this.props.course.item||null;
        this.itemCourse.value(course?{id:course._id,text:course.name}:null);
        this.itemUser.value(user?{id:user._id,text:`${user.lastname} ${user.firstname}`}:''); 
        this.setState({_id});
    }

    onSubmit = () => {
        const _courseId = this.itemCourse.value(),
            _userId = this.itemUser.value();
        if (!_courseId) {
            T.notify('Khóa học bị trống!', 'danger');
            this.itemCourse.focus();
        }else if (!_userId) {
            T.notify('Người được gán bị trống!', 'danger');
            this.itemUser.focus();
        }else{
            this.props.update(_courseId,{_userId},this.hide);
        } 
    }
    render = () => this.renderModal({
        title: 'Tuyển sinh khóa học',
        body: <>
            <div className='row'>
                <FormSelect ref={e => this.itemCourse = e} className='col-md-12' label='Khóa học' data={ajaxSelectOfficialCourse}  readOnly={this.props.readOnly}/>
                <FormSelect ref={e => this.itemUser = e} className='col-md-12' data={ajaxSelectUserType(['isStaff'])} readOnly={this.props.readOnly} label='Người dùng' />
            </div>
        </>,
        size: 'medium'
    });
}

class CourseEnrollPage extends AdminPage {
    state = {type:'enrollManager'};
    componentDidMount() {
        this.props.getCourseAll({},list => {
            // const course = list[0];
            const course = list[0];
            this.itemCourse.value(course?{id:course._id,text:course.name}:null);
            course && this.props.getCourse(course._id);
        });

        this.props.getRoleAll();
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Quản trị viên khóa học', 'Bạn có chắc bạn muốn xóa quản trị viên này?', true, isConfirm =>{
        if (isConfirm && this.props.course && this.props.course.item) {
            let { _id } = this.props.course.item;
            this.props.updateCourseRole(_id,{_userId:item.user._id},'remove',this.state.type);
            // admins=admins.filter(admin=>admin._id!=item._id).map(item=>item._id);
            // this.props.updateCourse(_id, { admins: admins.length ? admins : 'empty' });
        }
    });

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    getData = data => {
        this.props.getCourse(data.id);
    }

    updateCourse = (_courseId,data,done)=>{
        this.props.updateCourseRole(_courseId,{...data},'add',this.state.type,()=>{
            done && done();
            const course = this.props.course && this.props.course.item ? this.props.course.item :null;
            course && this.itemCourse.value({id:course._id,text:course.name});
        });
    }
    render() {
        const permission = this.getUserPermission('assignRole'),
        type=this.state.type,
        allRoles = this.props.role && this.props.role.list ? this.props.role.list.map(item=>({id:item._id,text:item.name})) : [];
        let list = this.props.course && this.props.course.item && this.props.course.item.roleManager && this.props.course.item.roleManager.length ? this.props.course.item.roleManager:[];
        list = list.filter(item=>item.role==type);
        const table = renderTable({
                getDataSource: () => list,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>CMND/CCCD</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell type='text' content={item.user?`${item.user.lastname} ${item.user.firstname}`:''}/>
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.user?item.user.identityCard:''} />
                        <TableCell type='buttons' content={item} permission={permission} onDelete={this.delete} />
                    </tr>),
            });

        return this.renderPage({
            icon: 'fa fa-user-plus',
            title: 'Tuyển sinh khóa học',
            breadcrumb: ['Tuyển sinh khóa học'],
            content: <>
                <div className='tile'>
                    <div className='row'>
                        <FormSelect ref={e => this.itemCourse = e} className='col-md-4' label='Khóa học' data={ajaxSelectOfficialCourse} onChange={data => this.getData(data)} readOnly={!permission.write} />
                    </div>
                    {table}
                </div>
                <AssignRoleModal ref={e => this.modal = e} allRoles={allRoles} readOnly={!permission.write} update={this.updateCourse} course = {this.props.course} type={this.state.type}/>
            </>,
            onCreate:permission.write ?()=> this.modal.show():null,
            backRoute:'/user/assign-role',
        });
    }
}

const mapStateToProps = state => ({ system: state.system,course:state.trainning.course,role: state.framework.role });
const mapActionsToProps = { getCourseAll,getCourse,updateCourseRole,getAssignRolePage,getRoleAll };
export default connect(mapStateToProps, mapActionsToProps)(CourseEnrollPage);
