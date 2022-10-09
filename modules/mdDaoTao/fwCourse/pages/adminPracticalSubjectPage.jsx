import React from 'react';
import { connect } from 'react-redux';
import { getCourse } from '../redux';
import { Link } from 'react-router-dom';
import { AdminPage, PageIconHeader, PageIcon } from 'view/component/AdminPage';
import {getSubjectAll} from 'modules/mdDaoTao/fwSubject/redux';

const backRoute = '/user/course';
class EditCoursePage extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/practical-subject').parse(window.location.pathname);
            if (params && params._id) {
                this.props.getCourse(params._id, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push(backRoute+'/'+params._id);
                    }else if(data.item){
                        const practicalSubjectId = (data.item.subjects||[]).filter(item=>item.monThucHanh==true).map(item=>item._id);
                        this.props.getSubjectAll({_id:{$in:practicalSubjectId}},practicalSubjects=>this.setState({practicalSubjects}));
                    }else{
                        this.props.history.push(backRoute+'/'+params._id);
                    }
                });
            } else {
                this.props.history.push(backRoute);
            }
        });
    }

    render() {
        const currentUser = this.props.system ? this.props.system.user : null,
            { isCourseAdmin,isLecturer } = currentUser,
            {practicalSubjects=[]} = this.state,
            item = this.props.course && this.props.course.item ? this.props.course.item : {};
            return this.renderPage({
            icon: 'fa fa-car',
            title: 'Học thực hành: ' + item.name,
            breadcrumb: [<Link key={0} to={backRoute}>Khóa học</Link>, item.name],
            content: (
                <div className='row user-course'>
                    {practicalSubjects.length ? practicalSubjects.map((subject,index)=>{
                        return (<div key={index} className='row user-course'>
                        <PageIconHeader visible={isLecturer ||isCourseAdmin} text={subject.title} />
                        {subject.lessons && subject.lessons.length && subject.lessons.map((lesson,index)=>
                            (<PageIcon key={index} visible={true} to={`/user/course/${item._id}/practical-subject/${subject._id}/lesson/${lesson._id}`} icon='fa-car' iconBackgroundColor='#1488db' text={lesson.title} />)
                        )}
                    </div>);
                    }):null}
                </div>
            ),
            backRoute: backRoute + '/' + item._id,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course,subject:state.trainning.subject });
const mapActionsToProps = { getCourse,getSubjectAll };
export default connect(mapStateToProps, mapActionsToProps)(EditCoursePage);
