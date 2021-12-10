import React from 'react';
import { connect } from 'react-redux';
import { getSubjectByStudent } from './redux';
import { getStudentScore,getStudentSubjectScore } from '../fwStudent/redux';
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
                    this.props.getStudentSubjectScore(this.state.courseId, data => {
                        if (data.error) {
                            this.props.history.push('/user');
                        } else {
                            this.setState({ tienDoThiHetMon: data[params._id] });
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
        const {tienDoHocTap, tienDoThiHetMon} = this.state,
            diemThiHetMon = (tienDoThiHetMon && tienDoThiHetMon.diemTB) ? (tienDoThiHetMon.diemTB*10) : 0,
            monThucHanh = this.props.subject && this.props.subject.item && this.props.subject.item.monThucHanh;
        const lessons = this.props.subject && this.props.subject.item && this.props.subject.item.lessons ? this.props.subject.item.lessons : [];
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId;
        let finishedLesson = 0;
        if (monThucHanh) {
            lessons.length && lessons.forEach((lesson, index) => {
                if (tienDoHocTap && tienDoHocTap[lesson._id]) {
                    finishedLesson = index + 1;
                }
            });
        } else {
            lessons.length && lessons.forEach((lesson, index) => {
                // if (tienDoHocTap && tienDoHocTap[lesson._id] && tienDoHocTap[lesson._id].diemTB && tienDoHocTap[lesson._id].diemTB > 0.5) {
                //     finishedLesson = index + 1;
                // } else if (!lesson.questions.length) {
                //     if (index == 0 && tienDoHocTap && tienDoHocTap[lesson._id] && tienDoHocTap[lesson._id].view)
                //         finishedLesson = index + 1;
                //     else if (tienDoHocTap && tienDoHocTap[lessons[index - 1]._id])
                //         finishedLesson = index + 1;
                // }
                if(lesson.questions.length){
                    if (tienDoHocTap && tienDoHocTap[lesson._id] && tienDoHocTap[lesson._id].diemTB && tienDoHocTap[lesson._id].diemTB > 0.5) {
                        finishedLesson = index + 1;
                    } 
                } else {
                   if(tienDoHocTap && tienDoHocTap[lesson._id] && tienDoHocTap[lesson._id].view) finishedLesson = index + 1;
                }
            });
        }
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
                                {tienDoHocTap && tienDoHocTap[lesson._id] && tienDoHocTap[lesson._id].answers ? 
                                    <div><p>Đã hoàn thành</p>{!monThucHanh && <p> Điểm ôn tập:{((tienDoHocTap[lesson._id].score ? 
                                        tienDoHocTap[lesson._id].score : 0) + '/' + Math.min(lesson.numQuestion, lesson.questions.length))}
                                        {(tienDoHocTap[lesson._id].diemTB && tienDoHocTap[lesson._id].diemTB > 0.5) ? ' (Đạt)' : ' (Chưa đạt)'}</p>}</div> 
                                    : ((lesson.questions.length || !monThucHanh) ? <p>Chưa hoàn thành</p> : <p>Đã hoàn thành</p>)}
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
                    {lessons && tienDoHocTap && (Object.keys(tienDoHocTap).length >= lessons.length) ?
                        <>
                        <h4 style={{ width: '100%' }}>Câu hỏi phản hồi</h4>
                            <Link className='col-md-6' to={'/user/hoc-vien/khoa-hoc/' + this.state.courseId + '/mon-hoc/phan-hoi/' + this.state.subjectId}>
                                <div className={'widget-small coloured-icon warning'}>
                                    <i className='icon fa fa-3x fa-comments' />
                                    <div className='info'>
                                        <h4>Câu hỏi phản hồi</h4>
                                    </div>
                                </div>
                            </Link>
                        <h4 style={{ width: '100%' }}>Thi hết môn</h4>
                            <Link className='col-md-6' to={'/user/hoc-vien/khoa-hoc/' + this.state.courseId + '/mon-hoc/thi-het-mon/' + this.state.subjectId}>
                                <div className={'widget-small coloured-icon danger'} >
                                    <i className='icon fa fa-3x fa-pencil-square-o' />
                                    <div className='info'>
                                        <h4>Thi hết môn</h4>
                                        {tienDoThiHetMon ? <p>Điểm: {diemThiHetMon + ' (' + ((diemThiHetMon > 5) ? 'Đạt) ' : 'Không đạt) ')}</p> : null}
                                    </div>
                                </div>
                            </Link>
                        </> : <></>
                    }
                </div>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.trainning.subject });
const mapActionsToProps = { getSubjectByStudent, getStudentScore,getStudentSubjectScore };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);
