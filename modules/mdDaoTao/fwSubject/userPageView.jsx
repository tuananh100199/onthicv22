import React from 'react';
import { connect } from 'react-redux';
import { getSubjectByStudent } from './redux';
import { getStudentScore } from '../fwStudent/redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';

class AdminEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        let url = window.location.pathname,
            params = T.routeMatcher('/user/hoc-vien/khoa-hoc/mon-hoc/:_id').parse(url);
        this.setState({ subjectId: params._id });
        if (params._id) {
            this.props.getSubjectByStudent(params._id, data => {
                if (data.error) {
                    T.notify('Lấy môn học bị lỗi!', 'danger');
                    this.props.history.push('/user');
                } else if (data.item && data.currentCourse) {
                    this.props.getStudentScore(data => {
                        if (data.error) {
                            this.props.history.push('/user');
                        } else {
                            this.setState({ tienDoHocTap: data[params._id] });
                        }
                    });
                    T.ready('/user/hoc-vien/khoa-hoc/' + data.currentCourse);
                    const { _id, title, shortDescription, detailDescription } = data.item;
                    this.setState({ _id, title, shortDescription, detailDescription, courseId: data.currentCourse });
                } else {
                    this.props.history.push('/user');
                }
            });
        } else {
            this.props.history.push('/user');
        }
    }

    render() {
        const tienDoHocTap = this.state.tienDoHocTap;
        const lessons = this.props.subject && this.props.subject.item && this.props.subject.item.lessons ? this.props.subject.item.lessons : [];
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId;
        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Môn học: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to={userPageLink}>Khóa học</Link>, 'Môn học'],
            content: (
                <div className='row'>
                    <div className='col-12'>
                        <h4>Thông tin chung</h4>
                        <div className='row'>
                            <div className='col-md-6'>
                                <Link to={'/user/hoc-vien/khoa-hoc/mon-hoc/thong-tin/' + this.state.subjectId}>
                                    <div className='widget-small coloured-icon info'>
                                        <i className='icon fa fa-3x fa-info' />
                                        <div className='info'>
                                            <h4>Thông tin môn học</h4>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className='col-12'>
                        <h4>Bài học</h4>
                        <div className='row'>
                            {lessons.length ? lessons.map((lesson, index) => (
                                <div key={index} className='col-md-6 col-lg-6'>
                                    <Link to={'/user/hoc-vien/khoa-hoc/mon-hoc/bai-hoc/' + lesson._id}>
                                        <div className='widget-small coloured-icon primary'>
                                            <i className='icon fa fa-3x fa fa-briefcase' />
                                            <div className='info'>
                                                <h4>{lesson && lesson.title}</h4>
                                                {tienDoHocTap && tienDoHocTap[lesson._id] ? <div><p>Đã hoàn thành</p><p> Số câu đúng:{(tienDoHocTap[lesson._id].score + '/' + lesson.questions.length)}</p></div> : <p>Chưa hoàn thành</p>}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            )) : <div className='col-md-4'>Chưa có bài học</div>
                            }
                        </div>
                    </div>
                </div>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.subject, student: state.student });
const mapActionsToProps = { getSubjectByStudent, getStudentScore };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);