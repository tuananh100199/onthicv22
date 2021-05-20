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
            params = T.routeMatcher('/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/:_id').parse(url);
        this.setState({ subjectId: params._id, courseId: params.courseId });
        if (params._id) {
            this.props.getSubjectByStudent(params._id, data => {
                if (data.error) {
                    T.notify('Lấy môn học bị lỗi!', 'danger');
                    this.props.history.push('/user');
                } else if (data.item) {
                    this.props.getStudentScore(this.state.courseId, data => {
                        if (data.error) {
                            this.props.history.push('/user');
                        } else {
                            this.setState({ tienDoHocTap: data[params._id] });
                        }
                    });
                    T.ready('/user/hoc-vien/khoa-hoc/' + this.state.courseId);
                    const { _id, title, shortDescription, detailDescription } = data.item;
                    this.setState({ _id, title, shortDescription, detailDescription });
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
        let finishedLesson = 0;
        lessons.length && lessons.forEach((lesson, index) => {
            if (tienDoHocTap && tienDoHocTap[lesson._id]) {
                finishedLesson = index + 1;
            }
        });
        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Môn học: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to={userPageLink}>Khóa học</Link>, 'Môn học'],
            content: (
                <div className='row'>
                    <h4 style={{ width: '100%' }}>Thông tin chung</h4>
                    <Link className='col-md-6' to={'/user/hoc-vien/khoa-hoc/' + this.state.courseId + '/mon-hoc/thong-tin/' + this.state.subjectId}>
                        <div className={'widget-small coloured-icon info'}>
                            <i className='icon fa fa-3x fa-info' />
                            <div className='info'>
                                <h4>Thông tin môn học</h4>
                            </div>
                        </div>
                    </Link>
                    <h4 style={{ width: '100%' }}>Bài học</h4>
                    {lessons.length ? lessons.map((lesson, index) => {
                        const content = (<div className='widget-small coloured-icon info'>
                            <i className='icon fa fa-3x fa fa-briefcase' style={{ backgroundColor: (finishedLesson == index ? '#007bff' : (finishedLesson > index ? '#17a2b8' : '#6c757d')) }} />
                            <div className='info'>
                                <h4>{lesson && lesson.title}</h4>
                                {tienDoHocTap && tienDoHocTap[lesson._id] ? <div><p>Đã hoàn thành</p><p> Số câu đúng:{((tienDoHocTap[lesson._id].score ? tienDoHocTap[lesson._id].score : 0) + '/' + lesson.numQuestion)}</p></div> : <p>Chưa hoàn thành</p>}
                            </div>
                        </div>);
                        const show = (
                            <div key={index} className='col-md-6'>
                                {
                                    finishedLesson < index ? content :
                                        <Link to={'/user/hoc-vien/khoa-hoc/' + this.state.courseId + '/mon-hoc/' + this.state.subjectId + '/bai-hoc/' + lesson._id}>
                                            {content}
                                        </Link>
                                }
                            </div>);
                        return show;
                    }) : <div className='col-md-4'>Chưa có bài học</div>
                    }
                </div>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.trainning.subject });
const mapActionsToProps = { getSubjectByStudent, getStudentScore };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);