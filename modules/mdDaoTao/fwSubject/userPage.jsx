import React from 'react';
import { connect } from 'react-redux';
import { getSubjectByStudent } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';

const userPageLink = '/user/hoc-vien/khoa-hoc';
class AdminEditPage extends AdminPage {
    state = {};
    componentDidMount() {

        let url = window.location.pathname,
            params = T.routeMatcher('/user/hoc-vien/khoa-hoc/mon-hoc/:_id').parse(url);
        this.setState({ subjectId: params._id })
        if (params._id) {
            this.props.getSubjectByStudent(params._id, data => {
                if (data.error) {
                    T.notify('Lấy môn học bị lỗi!', 'danger');
                    this.props.history.push(userPageLink);
                } else if (data.item && data.currentCourse) {
                    T.ready('/user/hoc-vien/khoa-hoc/' + data.currentCourse);
                    const { _id, title, shortDescription, detailDescription } = data.item;
                    this.setState({ _id, title, shortDescription, detailDescription, courseId: data.currentCourse });
                } else {
                    this.props.history.push(userPageLink);
                }
            });
        } else {
            this.props.history.push(userPageLink);
        }
    }

    render() {
        const lessons = this.props.subject && this.props.subject.item && this.props.subject.item.lessons ? this.props.subject.item.lessons : [];
        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Môn học: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to={'/user/hoc-vien/khoa-hoc/' + this.state.courseId}>Khóa học</Link>, 'Môn học'],
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
                                <div key={index} className='col-md-6 col-lg-4'>
                                    <Link to={'/user/hoc-vien/khoa-hoc/mon-hoc/bai-hoc/' + lesson._id}>
                                        <div className='widget-small coloured-icon primary'>
                                            <i className='icon fa fa-3x fa fa-briefcase' />
                                            <div className='info'>
                                                <h4>{lesson && lesson.title}</h4>
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
        });
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.subject });
const mapActionsToProps = { getSubjectByStudent };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);