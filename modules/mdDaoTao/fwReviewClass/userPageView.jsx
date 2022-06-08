import React from 'react';
import { connect } from 'react-redux';
import { getReviewClassPage, addStudentReviewClass, deleteStudentReviewClass } from './redux';
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
                    T.ready('/user/hoc-vien/khoa-hoc/' + this.state.courseId);
                } else {
                    this.props.history.push('/user');
                }
            });
        } else {
            this.props.history.push('/user');
        }
    }
    
    registerClass = (reviewClass, type) => {
        const { student, courseTypeId, subjectId} = this.state;
        const studentId = student._id;
        if(reviewClass.students && (reviewClass.students.findIndex(student => student._id == studentId) == -1)){
            T.confirm('Đăng ký lớp ôn tập', 'Bạn có chắc muốn đăng ký lớp ôn tập ' + reviewClass.title, true, isConfirm =>
            isConfirm && this.props.addStudentReviewClass(reviewClass._id, student, courseTypeId, subjectId));
        } else if(type == 'button' && reviewClass.state == 'waiting') {
            const successContent = 
            `<h5 style='color:#199D76'><b>Bạn đã đăng ký thành công khoá học này</b></h5>
            <p style='color:#333'>Khoá học sẽ bắt đầu vào lúc: ${T.dateToText(reviewClass.dateStart, 'hh:ss dd/mm/yyyy')}</p>`;
            T.alert(successContent, 'info', true, 60000);
        } else if(type == 'button' && (reviewClass.state == 'reject' || reviewClass.state == 'autoReject')) {
            const successContent = 
            `<h5 style='color:#DC3545'><b>Khoá học bạn đăng ký đã bị huỷ</b></h5>
            <p style='color:#333'>Khoá học bạn đăng ký vào lúc: ${T.dateToText(reviewClass.dateStart, 'hh:ss dd/mm/yyyy')} đã bị huỷ.</p>
            <p style='color:#333'>Lý do: <b>${reviewClass.lyDoHuyOnTap ? reviewClass.lyDoHuyOnTap : 'Không đủ số lượng!'}</b></p>`;
            T.alert(successContent, 'info', true, 60000);
        } 
    }

    renderColor = (reviewClass) => {
        const studentId = this.state.student && this.state.student._id;
        if(reviewClass.students && (reviewClass.students.findIndex(student => student._id == studentId) != -1)){
            if(reviewClass.state == 'waiting') return '#FFC107';
            else if(reviewClass.state == 'approved') return '#28A745';
            else return '#DC3545';
        } else return '#007BFF';
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
                <Link key={index} className='col-md-6' to={'#'} onClick={e => e.preventDefault && this.registerClass(reviewClass, 'link')}>
                    <div className={'widget-small coloured-icon info'}>
                    <i className='icon fa fa-3x fa fa-briefcase' style={{ backgroundColor: this.renderColor(reviewClass) }} />
                        <div className='info'>
                            <div className='d-flex justify-content-between'>
                                <h4>{reviewClass && reviewClass.title}</h4>
                                {reviewClass.students && (reviewClass.students.findIndex(student => student._id == studentId) != -1) ?<div>
                                    <button className='btn btn-success' style={{width: '44px'}} onClick={e => e.preventDefault && this.registerClass(reviewClass, 'button')}><i className='fa fa-info' aria-hidden='true'></i></button>
                                    {(reviewClass.state == 'waiting' && (new Date(reviewClass.dateEnd) > new Date())) ? <button className='btn btn-danger' onClick={e => e.preventDefault && T.confirm('Huỷ đăng ký lớp ôn tập', 'Bạn có chắc muốn huỷ đăng ký lớp ' + reviewClass.title, true, isConfirm =>
                                        isConfirm && this.props.deleteStudentReviewClass(reviewClass._id, studentId, () => window.location.reload()))}><i className='fa fa-times' aria-hidden='true'></i></button> : null}
                                </div> : null}
                            </div>  
                            <div>
                                {reviewClass.dateStart ? <p>Ngày học: {T.dateToText(reviewClass.dateStart, 'hh:ss dd/mm/yyyy')}</p> : null}
                                {reviewClass.teacher ? <p>Giáo viên: {reviewClass.teacher.lastname + ' ' + reviewClass.teacher.firstname}</p> : null}
                                <p>Trạng thái: <b>{reviewClass.state == 'waiting' && (new Date(reviewClass.dateEnd) > new Date()) ? 'Đang mở đăng ký' : (reviewClass.state == 'waiting' ? 'Đang chờ duyệt' :(reviewClass.state == 'approved' ? 'Đã duyệt' : 'Đã huỷ'))}</b></p>
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
const mapActionsToProps = { getReviewClassPage, getCourseByStudent, addStudentReviewClass, deleteStudentReviewClass };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);
