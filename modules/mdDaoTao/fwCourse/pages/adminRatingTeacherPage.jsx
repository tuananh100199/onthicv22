import React from 'react';
import { connect } from 'react-redux';
import { getCourse } from '../redux';
import { getRatePage, getRateByCourse,createRate,updateRate,deleteRate } from 'modules/_default/fwRate/redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable,AdminModal,FormSelect,FormRichTextBox } from 'view/component/AdminPage';
import T from 'view/js/common';

const ratingDropDown = [
    {id:1,text:'1'},
    {id:2,text:'2'},
    {id:3,text:'3'},
    {id:4,text:'4'},
    {id:5,text:'5'},
];
class RatingModal extends AdminModal {

    onShow = (item) => {
        const { _id, user, value, note } = item || { _id: null,user: null, value:'', note:'' };
        this.itemUser.value(user?user._id:'');
        this.itemValue.value(value);
        this.itemNote.value(note);
        this.setState({ _id,user });
    }

    onSubmit = () => {
        const data = {
            user:this.itemUser.value(),
            value: this.itemValue.value(),
            note: this.itemNote.value(),
            _refId:this.props._refId
        };
        const checkExistUserRate = (user)=>{
            const listUserId = this.props.list.map(item=>item.user._id);
            return listUserId.indexOf(user)!=-1;
        };
        if (!data.user) {
            T.notify('Học viên bị trống!', 'danger');
            this.itemUser.focus();
        }else if(!this.state._id && checkExistUserRate(data.user)){
            T.notify('Học viên đã gửi đánh giá', 'danger');
            this.itemUser.focus();
        }
        else if (data.value == '') {
            T.notify('Số sao bị trống!', 'danger');
            this.itemValue.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data, ()=>this.props.getPage(this.hide)) : this.props.create(data,()=> this.props.getPage(this.hide));
        }
    }
    render = () => this.renderModal({
        title: 'Đánh giá giáo viên',
        body: <>
            <FormSelect ref={e => this.itemUser = e} readOnly={this.props.readOnly||this.state.user} label='Học viên' data={this.props.studentCourse}/>
            <FormSelect ref={e => this.itemValue = e} readOnly={this.props.readOnly}  label='Số sao' data={ratingDropDown}/>
            <FormRichTextBox rows={2} ref={e => this.itemNote = e}  label='Nội dung đánh giá' readOnly={this.props.readOnly} />
        </>
    });
}
class AdminTeacherRatePage extends AdminPage {
    state = {studentCourse:[]};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_courseId/rate-teacher/:_id').parse(window.location.pathname);
            if (params && params._courseId && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                this.setState({teacherId: params._id,_courseId:params._courseId});
                if (course) {
                    let studentCourse = [];
                    const {teacherGroups} = course;
                    teacherGroups && teacherGroups.length && teacherGroups.forEach(group=>{
                        if(group.teacher && group.teacher._id==params._id){
                            // lớp học của giáo viên hiện tại
                            studentCourse=group.student && group.student.length 
                            ? group.student.map(student=>({id:student.user._id,text:`${student.lastname} ${student.firstname}`})):[];
                        }
                    });
                    this.setState({studentCourse});
                    this.props.getRateByCourse(course._id);

                } else {
                    this.props.getCourse(params._courseId, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._courseId);
                        } else {
                            let studentCourse = [];
                            const {teacherGroups} = data.item;
                            teacherGroups && teacherGroups.length && teacherGroups.forEach(group=>{
                                if(group.teacher && group.teacher._id==params._id){
                                    // lớp học của giáo viên hiện tại
                                    studentCourse=group.student && group.student.length 
                                    ? group.student.map(student=>({id:student.user._id,text:`${student.lastname} ${student.firstname}`})):[];
                                }
                            });
                            this.setState({studentCourse});
                            this.props.getRateByCourse(params._courseId);
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    getPage = done=>{
        this.props.getRateByCourse(this.state._courseId,done);
    }
    edit = (e, item) => e.preventDefault() || this.modal.show(item);


    delete = (e, item) => e.preventDefault() || T.confirm('Xóa đánh giá', 'Bạn có chắc bạn muốn xóa đánh giá này?', true, isConfirm =>
        isConfirm && this.props.deleteRate(item._id,this.getPage));

    render() {
        const permission = this.getUserPermission('rate');
        const item = this.props.course && this.props.course.item ? this.props.course.item : { admins: [] };
        let listRate  = this.props.rate && this.props.rate.list ?
            this.props.rate.list : [];
        const list = [], teacherId = this.state.teacherId;
        let name = '';
        if(item.teacherGroups && item.teacherGroups.length){
            const index = item.teacherGroups.findIndex(group => group.teacher._id == teacherId);
            if(index != -1){
                name = item.teacherGroups[index].teacher ? (item.teacherGroups[index].teacher.lastname + item.teacherGroups[index].teacher.firstname) : '';
                listRate.forEach(rate => {
                    if(rate._refId == (item.teacherGroups[index].teacher && item.teacherGroups[index].teacher._id))
                        list.push(rate);
                });
            }
        }
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '40%' }} nowrap='true'>Học viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số sao</th>
                    <th style={{ width: '60%' }} nowrap='true'>Nội dung đánh giá</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Ngày đánh giá</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={`${item.user ? item.user.lastname : ''} ${item.user ? item.user.firstname : ''}`}/>
                    <TableCell type='text' content={item.value} />
                    <TableCell type='text' content={item.note} />
                    <TableCell type='text' style={{whiteSpace:'nowrap'}} content={T.dateToText(item.createdDate,'dd/mm/yyyy')} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete}></TableCell>
                </tr>),
        });

        const backRoute = `/user/course/${item._id}/rate-teacher`;
        return this.renderPage({
            icon: 'fa fa-star',
            title: 'Đánh giá Giáo viên: ' + name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={`/user/course/${item._id}`}>{item.name}</Link> : '',item._id ? <Link key={0} to={backRoute}>{'Đánh giá Giáo viên'}</Link> : '', name],
            content: (
                <div className='tile'>
                    <div className='tile-body'>{table}</div>
                    <RatingModal ref={e => this.modal = e} _refId={this.state.teacherId} list={list} readOnly={!permission.write} create={this.props.createRate} update={this.props.updateRate} getPage={this.getPage} studentCourse={this.state.studentCourse} />
                </div>
                
            ),
            onCreate:permission.write?this.edit:null,
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course, rate: state.framework.rate });
const mapActionsToProps = { getCourse, getRatePage, getRateByCourse,createRate,updateRate,deleteRate };
export default connect(mapStateToProps, mapActionsToProps)(AdminTeacherRatePage);
