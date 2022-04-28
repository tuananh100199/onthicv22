import React from 'react';
import { connect } from 'react-redux';
import { ajaxSelectCourse, getCourseAll,getCourse,updateCourse,updateCourseRole,updateAdminCourseRole } from 'modules/mdDaoTao/fwCourse/redux';
import { AdminPage, AdminModal, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';
import { ajaxSelectUserType } from 'modules/_default/fwUser/redux';

class CourseFeeModal extends AdminModal {

    onShow = () => {
        const course = this.props.course.item||null;
        this.itemCourse.value(course?{id:course._id,text:course.name}:null);
        this.itemUser.value(null); 
    }

    onSubmit = () => {
        const _id = this.itemCourse.value(),
            _userId = this.itemUser.value();
        if (!_id) {
            T.notify('Khóa học bị trống!', 'danger');
            this.itemCourse.focus();
        }else if (!_userId) {
            T.notify('Người được gán bị trống!', 'danger');
            this.itemUser.focus();
        }else{
            this.props.update(_id,_userId,this.hide);
        } 
    }
    render = () => this.renderModal({
        title: 'Quản trị khóa học',
        body: <>
            <div className='row'>
                <FormSelect ref={e => this.itemCourse = e} className='col-md-6' label='Khóa học' data={ajaxSelectCourse}  readOnly={this.props.readOnly}/>
                <FormSelect ref={e => this.itemUser = e} className='col-md-6' data={ajaxSelectUserType(['isCourseAdmin'])} readOnly={this.props.readOnly} label='Người dùng' />
            </div>
        </>,
        size: 'medium'
    });
}

class CourseFeePage extends AdminPage {
    state = {type:'admins'};
    componentDidMount() {
        this.props.getCourseAll({},list => {
            // const course = list[0];
            const course = list[0];
            this.itemCourse.value(course?{id:course._id,text:course.name}:null);
            course && this.props.getCourse(course._id);
        });
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Quản trị viên khóa học', 'Bạn có chắc bạn muốn xóa quản trị viên này?', true, isConfirm =>{
        if (isConfirm && this.props.course && this.props.course.item) {
            let { _id } = this.props.course.item;
            this.props.updateAdminCourseRole(_id,item._id,'remove');
        }
    });

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    getData = data => {
        this.props.getCourse(data.id);
    }

    updateCourse = (_courseId,_userId,done)=>{
        this.props.updateAdminCourseRole(_courseId,_userId,'add',()=>{
            done && done();
            const course = this.props.course && this.props.course.item ? this.props.course.item :null;
            course && this.itemCourse.value({id:course._id,text:course.name});
        });
    }
    render() {
        const permission = this.getUserPermission('assignRole'),
        type=this.state.type,
        list = this.props.course && this.props.course.item && this.props.course.item[type] && this.props.course.item[type].length ? this.props.course.item[type]:[];
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
                        <TableCell type='text' content={`${item.lastname} ${item.firstname}`}/>
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.identityCard} />
                        <TableCell type='buttons' content={item} permission={permission} onDelete={this.delete} />
                    </tr>),
            });

        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Quản trị khóa học',
            breadcrumb: ['Quản trị khóa học'],
            content: <>
                <div className='tile'>
                    <div className='row'>
                        <FormSelect ref={e => this.itemCourse = e} className='col-md-4' label='Khóa học' data={ajaxSelectCourse} onChange={data => this.getData(data)} readOnly={!permission.write} />
                    </div>
                    {table}
                </div>
                <CourseFeeModal ref={e => this.modal = e} readOnly={!permission.write} update={this.updateCourse} course = {this.props.course} type={this.state.type}/>
            </>,
            onCreate:permission.write ?()=> this.modal.show():null,
            backRoute:'/user/assign-role',
        });
    }
}

const mapStateToProps = state => ({ system: state.system,course:state.trainning.course,assignRole:state.framework.assignRole });
const mapActionsToProps = { getCourseAll,getCourse,updateCourse,updateCourseRole,updateAdminCourseRole };
export default connect(mapStateToProps, mapActionsToProps)(CourseFeePage);
