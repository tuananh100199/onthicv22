import React from 'react';
import { connect } from 'react-redux';
import { getReviewClassPage, addStudentReviewClass } from './redux';
import { getCourseByStudent } from '../fwCourse/redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';

class AdminEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        let url = window.location.pathname,
            params = T.routeMatcher('/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/lop-on-tap/:_id').parse(url);
        this.setState({ subjectId: params._id, courseId: params.courseId });
        if (params._id) {
            this.props.getCourseByStudent(params.courseId, data => {
                if (data.error) {
                    T.notify('Lấy khoá học bị lỗi!', 'danger');
                    this.props.history.push('/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/:_id');
                } else if (data.item) {
                    this.props.getReviewClassPage(1,20,{courseType: data.item.courseType._id, subject: params._id}, reviewClass => {
                        if (reviewClass.error) {
                            this.props.history.push('/user');
                        } else {
                            this.setState({listClass: reviewClass.list, student: data.student, courseTypeId: data.item.courseType._id});
                        }
                    });
                    T.ready('/user/hoc-vien/khoa-hoc/' + this.state.courseId + '/mon-hoc');
                } else {
                    this.props.history.push('/user');
                }
            });
        } else {
            this.props.history.push('/user');
        }
    }
    
    registerClass = (reviewClass) => {
        const { student, courseTypeId, subjectId} = this.state;
        const studentId = student._id;
        if(reviewClass.students && (reviewClass.students.findIndex(student => student._id == studentId) == -1)){
            T.confirm('Đăng ký lớp ôn tập', 'Bạn có chắc muốn đăng ký lớp ôn tập ' + reviewClass.title, true, isConfirm =>
            isConfirm && this.props.addStudentReviewClass(reviewClass._id, student, courseTypeId, subjectId));
        } else {
            const successContent = 
            `<h5 style='color:#199D76'><b>Bạn đã đăng ký thành công khoá học này</b></h5>
            <p style='color:#333'>Khoá học sẽ bắt đầu vào lúc: ${T.dateToText(reviewClass.dateStart, 'hh:ss dd/mm/yyyy')}</p>`;
            T.alert(successContent, 'info', true, 60000);
        } 
    }

    render() {
        const studentId = this.state.student && this.state.student._id;
        const list  = this.props.reviewClass && this.props.reviewClass.page ? this.props.reviewClass.page.list : [];
        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Lớp ôn tập',
            breadcrumb: [<Link key={0} to={'/user'}>Khóa học</Link>, 'Môn học'],
            content: (
            <div className='row'>
            {list && list.length ? list.map((reviewClass, index) =>(
                <Link key={index} className='col-md-6' to={'#'} onClick={e => e.preventDefault && this.registerClass(reviewClass)}>
                    <div className={'widget-small coloured-icon info'}>
                    <i className='icon fa fa-3x fa fa-briefcase' style={{ backgroundColor:  (reviewClass.students && (reviewClass.students.findIndex(student => student._id == studentId) != -1) ? '#28a745' : '#17a2b8') }} />
                        <div className='info'>
                            <h4>{reviewClass && reviewClass.title}</h4>
                            <div>
                                {reviewClass.dateStart ? <p>Ngày học: {T.dateToText(reviewClass.dateStart, 'hh:ss dd/mm/yyyy')}</p> : null}
                                {reviewClass.teacher ? <p>Giáo viên: {reviewClass.teacher.lastname + ' ' + reviewClass.teacher.firstname}</p> : null}
                            </div>
                        </div>
                    </div>
                </Link>
               )) : null}
            </div>
              
            ),
            backRoute: '/user/hoc-vien/khoa-hoc/' + this.state.courseId + '/mon-hoc/' + this.state.subjectId,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, reviewClass: state.training.reviewClass });
const mapActionsToProps = { getReviewClassPage, getCourseByStudent, addStudentReviewClass };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);
