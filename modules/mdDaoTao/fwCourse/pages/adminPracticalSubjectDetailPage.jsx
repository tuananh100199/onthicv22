import React from 'react';
import { connect } from 'react-redux';
import { getSubjectByStudent } from 'modules/mdDaoTao/fwSubject/redux';
import { updateStudentLessonState } from 'modules/mdDaoTao/fwLesson/redux';
import { getStudentScore, getStudentSubjectScore } from 'modules/mdDaoTao/fwStudent/redux';
import { Link } from 'react-router-dom';
import { AdminPage,renderTable, TableCell } from 'view/component/AdminPage';
import { getCourse, getLearningProgressPage } from '../redux';
import Dropdown from 'view/component/Dropdown';

const teacherCheckMapper = {
    pass: { text: 'Đạt', style: { color: '#1488db' } },
    waiting: { text: 'Đang chờ duyệt', style: { color: '#ffc107' } },
    fail: { text: 'Chưa đạt', style: { color: '#F80000' } },
};

const states = Object.entries(teacherCheckMapper).map(([key, value]) => ({ id: key, text: value.text }));
class AdminEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        let url = window.location.pathname,
            params = T.routeMatcher('/user/course/:courseId/practical-subject/:_id/lesson/:_lessonId').parse(url);
        this.setState({ subjectId: params._id, courseId: params.courseId,lessonId:params._lessonId });
        if (params._id && params.courseId) {
            this.props.getSubjectByStudent(params._id, data => {
                if (data.error) {
                    T.notify('Lấy môn học bị lỗi!', 'danger');
                    this.props.history.push(`/user/course/${params.courseId}/practical-subject`);
                } else if (data.item) {
                    const { lessons } = data.item;
                    const lesson = lessons.find(item=>item._id==params._lessonId);
                    if(lesson){
                        this.setState({title:lesson.title,_id:lesson._id});
                    }else{
                        this.props.history.push(`/user/course/${params.courseId}/practical-subject`);
                    }
                } else {
                    this.props.history.push(`/user/course/${params.courseId}/practical-subject`);
                }
            });
            const course = this.props.course ? this.props.course.item : null;
            if (course) {
                this.props.getLearningProgressPage(undefined, undefined, { courseId: course._id, filter: 'all' });
            } else {
                this.props.getCourse(params.courseId, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push('/user/course');
                    } else {
                        this.props.getLearningProgressPage(undefined, undefined, { courseId: params.courseId, filter: 'all' });
                    }
                });
            }
        } else {
            this.props.history.push('/user/course');
        }
    }

    renderLessonHead = (lessons)=>lessons.map((item,index)=>
        (<th key={index} style={{ width: 'auto' }} nowrap='true'>{item.title}</th>)
    )

    updateState = (studentId,lessonId,subjectId,courseId,state)=>{
        this.props.updateStudentLessonState(studentId,lessonId,subjectId,courseId,state,()=>{
            this.props.getLearningProgressPage(undefined, undefined, { courseId: courseId, filter: 'all' });
        });
    }

    renderLessonBody = (student,lessons)=>{
        if(!student||!lessons||!lessons.length) return null;
        const {tienDoHocTap} = student;
        return lessons.map((lesson,index)=>{
            if(!tienDoHocTap||!tienDoHocTap[this.state.subjectId]){
                return <TableCell key={index} type='text' style={{whiteSpace:'nowrap'}} content={'Chưa xem video'} />;
            }
            else{
                const tienDoBaiHocs = tienDoHocTap[this.state.subjectId];
                const isView =tienDoBaiHocs[lesson._id] && tienDoBaiHocs[lesson._id].view && tienDoBaiHocs[lesson._id].view=='true';
                const teacherCheckState = tienDoBaiHocs[lesson._id] && tienDoBaiHocs[lesson._id].state?tienDoBaiHocs[lesson._id].state:'waiting';
                const selectedState = teacherCheckMapper[teacherCheckState],
                dropdownComponent = <Dropdown items={states} item={selectedState} 
                onSelected={e => this.updateState(student._id,lesson._id,this.state.subjectId,this.state.courseId,e.id)} textStyle={selectedState ? selectedState.style : null} />;
                return isView?<TableCell key={index} type='text' content={dropdownComponent} />
                            :<TableCell key={index} type='text' style={{whiteSpace:'nowrap'}} content={'Chưa xem video'} />;
            }
        });
    }

    renderState = (student)=>{
        const {tienDoHocTap} = student;
        if(!tienDoHocTap || !tienDoHocTap[this.state.subjectId] ||!tienDoHocTap[this.state.subjectId][this.state.lessonId]){
            return <TableCell type='text' style={{whiteSpace:'nowrap'}} content={'Chưa xem video'} />;
        }else{
            const tienDoBaiHoc = tienDoHocTap[this.state.subjectId][this.state.lessonId];
            if(!tienDoBaiHoc.view){
            return <TableCell type='text' style={{whiteSpace:'nowrap'}} content={'Chưa xem video'} />;
            }else{
                const state = tienDoBaiHoc.state?tienDoBaiHoc.state:'waiting',
                 selectedState = teacherCheckMapper[state],
                dropdown = <Dropdown items={states} item={selectedState} 
                onSelected={e => this.updateState(student._id,this.state.lessonId,this.state.subjectId,this.state.courseId,e.id)} textStyle={selectedState ? selectedState.style : null} />;
             return <TableCell type='text' style={{textAlign:'center'}} content={dropdown} />;
            }
        }
    }

    render() {
        const backRoute = '/user/course/' + this.state.courseId+'/practical-subject';
        const item = this.props.course && this.props.course.item ? this.props.course.item : {},
            students = this.props.course && this.props.course && this.props.course.students ? this.props.course.students : [];
            const courseId = item._id;
        console.log({students});
            const table = renderTable({
            getDataSource: () => students, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên học viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>CMND/CCCD</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số điện thoại</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Trạng thái</th>
                </tr>),
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell type='link' content={item.lastname + ' ' + item.firstname} url={'/user/course/'+ courseId + '/your-students/' + item._id}/>
                        <TableCell type='text' content={item.identityCard} />
                        <TableCell type='text' content={item.user ? item.user.phoneNumber : ''} />
                        {this.renderState(item)}
                    </tr>);
            },
        });
        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Bài thực hành: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to={backRoute}>Môn thực hành</Link>, 'Môn học'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>{table}</div>
                </div>
            ),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.trainning.subject,course:state.trainning.course });
const mapActionsToProps = { getSubjectByStudent, getStudentScore, getStudentSubjectScore,getLearningProgressPage,getCourse,updateStudentLessonState };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);
