import React from 'react';
import { connect } from 'react-redux';
import { getSubjectByStudent } from './redux';
import { getStudentScore, getStudentSubjectScore } from '../fwStudent/redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';

const stateMapper = {
    pass:{text:'Đạt',color:'#7cb342'},
    waiting:{text:'Đang chờ',color:'#ffc107'},
    fail:{text:'Không đạt',color:'#dc3545'},
    disabled:{text:'Chưa mở',color:'#6c757d'},
    notView:{text:'Chưa hoàn thành',color:'#007bff'}
};
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
                        if (data && data.error) {
                            this.props.history.push('/user');
                        } else if (data) {
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

    renderContentBaiHocLyThuyet = (lesson,tienDoHocTap,finishedLesson,index)=>{
        const getBackgroundColor = ()=>{
            if(finishedLesson==index){
                if(tienDoHocTap && tienDoHocTap[lesson._id] && tienDoHocTap[lesson._id].answers){
                    const state =tienDoHocTap[lesson._id].diemTB && tienDoHocTap[lesson._id].diemTB >= 0.5 ? 'pass' : 'fail';
                    return stateMapper[state].color;
                }else{
                    return stateMapper.notView.color;
                }
            }else if(finishedLesson<index){
                return stateMapper.disabled.color;
            }else{
                return stateMapper.pass.color;
            }
        };

        const backgroundColor = getBackgroundColor();
        const content = (
            <div className='widget-small coloured-icon info'>
                <i className='icon fa fa-3x fa fa-briefcase' style={{ backgroundColor  }} />
                <div className='info'>
                    <h4>{lesson && lesson.title}</h4>
                    {tienDoHocTap && tienDoHocTap[lesson._id] && tienDoHocTap[lesson._id].answers ?
                        <div>
                            <p>Đã hoàn thành</p>
                            <p> Điểm ôn tập:{((tienDoHocTap[lesson._id].score ?
                                tienDoHocTap[lesson._id].score : 0) + '/' + Math.min(lesson.numQuestion, Object.keys(tienDoHocTap[lesson._id].answers).length))}
                                {(tienDoHocTap[lesson._id].diemTB && tienDoHocTap[lesson._id].diemTB >= 0.5) ? ' (Đạt)' : ' (Chưa đạt)'}
                            </p>
                        </div>
                        : ((lesson.questions.length) ? <p>Chưa hoàn thành</p> :
                        //  (((tienDoHocTap && tienDoHocTap[lesson._id] && (tienDoHocTap[lesson._id].view || (tienDoHocTap[lesson._id].viewedVideo && lesson.videos && Object.keys(tienDoHocTap[lesson._id].viewedVideo).length == lesson.videos.length))) ? <p>Đã hoàn thành</p> : <p>Chưa hoàn thành</p>))
                        <p>Đã hoàn thành</p>
                            )}
                </div>
            </div>
        );

        return content;
    }

    renderContentBaiHocThucHanh = (lesson,tienDoHocTap,finishedLesson,index)=>{

        const getBackgroundColor = ()=>{
            if(finishedLesson==index){
                return '#007bff';
            }else if(finishedLesson<index){
                return '#6c757d';
            }else{
                return !tienDoHocTap[lesson._id].state?'#ffc107':stateMapper[tienDoHocTap[lesson._id].state].color;
            }
        };
        const backgroundColor = getBackgroundColor();
        const getMonThucHanhStateText = ()=>{
            if(  tienDoHocTap && 
                tienDoHocTap[lesson._id] && 
                (tienDoHocTap[lesson._id].view || 
                    (tienDoHocTap[lesson._id].viewedVideo && lesson.videos && 
                        Object.keys(tienDoHocTap[lesson._id].viewedVideo).length == lesson.videos.length
                    )
                )
            ){
                return <>
                    <p>Đã hoàn thành</p>
                    <p>Giáo viên chấm: {!tienDoHocTap[lesson._id].state?'Đang chờ':stateMapper[tienDoHocTap[lesson._id].state].text}</p>
                </>;
            }else{
                return <p>Chưa hoàn thành</p>;
            }
        };

        const content = (
            <div className='widget-small coloured-icon info'>
                <i className='icon fa fa-3x fa fa-briefcase' style={{ backgroundColor }} />
                <div className='info'>
                    <h4>{lesson && lesson.title}</h4>
                    {getMonThucHanhStateText()}
                </div>
            </div>
        );
        return content;
    }

    render() {
        const { tienDoHocTap, tienDoThiHetMon } = this.state,
            diemThiHetMon = (tienDoThiHetMon && tienDoThiHetMon.diemTB) ? (tienDoThiHetMon.diemTB * 10) : 0,
            monThucHanh = this.props.subject && this.props.subject.item && this.props.subject.item.monThucHanh;
        const lessons = this.props.subject && this.props.subject.item && this.props.subject.item.lessons ? this.props.subject.item.lessons : [];
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId;
        let finishedLesson = 0;
        if (monThucHanh) {
            lessons.length && lessons.forEach((lesson, index) => {
                if (tienDoHocTap && tienDoHocTap[lesson._id] && tienDoHocTap[lesson._id].view) {
                    finishedLesson = index + 1;
                }
            });
        } else {
            lessons.length && lessons.forEach((lesson, index) => {
                if (lesson.questions.length) {
                    if (tienDoHocTap && tienDoHocTap[lesson._id] && tienDoHocTap[lesson._id].diemTB && tienDoHocTap[lesson._id].diemTB >= 0.5) {
                        finishedLesson = index + 1;
                    }
                } else {
                    if (tienDoHocTap && tienDoHocTap[lesson._id] && (tienDoHocTap[lesson._id].view || (tienDoHocTap[lesson._id].viewedVideo && lesson.videos && Object.keys(tienDoHocTap[lesson._id].viewedVideo).length == lesson.videos.length))) finishedLesson = index + 1;
                }
            });
        }
        return this.renderPage({
            icon: 'fa fa-book',
            title: 'MÔN HỌC: ' + (this.state.title?this.state.title.toUpperCase() : '...'),
            breadcrumb: [<Link key={0} to={userPageLink}>Khóa học</Link>, 'Môn học'],
            content: (
                <div className='row'>
                    <h4 style={{ width: '100%' }}>Thông tin chung</h4>
                    <Link className='col-md-6' to={'/user/hoc-vien/khoa-hoc/' + this.state.courseId + '/mon-hoc/thong-tin/' + this.state.subjectId}>
                        <div className={'widget-small coloured-icon info'}>
                            <i className='icon fa fa-3x fa-info'/>
                            <div className='info'>
                                <h4>Thông tin môn học</h4>
                            </div>
                        </div>
                    </Link>
                    <h4 style={{ width: '100%' }}>Bài học</h4>
                    {lessons.length ? lessons.map((lesson, index) => {
                        const getBackgroundColor = ()=>{
                            if(monThucHanh){
                                if(finishedLesson==index){
                                    return '#007bff';
                                }else if(finishedLesson<index){
                                    return '#6c757d';
                                }else{
                                    return !tienDoHocTap[lesson._id].state?'#ffc107':stateMapper[tienDoHocTap[lesson._id].state].color;
                                }
                            }else{
                                return finishedLesson == index ? '#007bff' : (finishedLesson > index ? '#17a2b8' : '#6c757d');
                            }
                        };

                        const getMonThucHanhStateText = ()=>{
                            if(  tienDoHocTap && 
                                tienDoHocTap[lesson._id] && 
                                (tienDoHocTap[lesson._id].view || 
                                    (tienDoHocTap[lesson._id].viewedVideo && lesson.videos && 
                                        Object.keys(tienDoHocTap[lesson._id].viewedVideo).length == lesson.videos.length
                                    )
                                )
                            ){
                                return <>
                                    <p>Đã hoàn thành</p>
                                    <p>Giáo viên chấm: {!tienDoHocTap[lesson._id].state?'Đang chờ':stateMapper[tienDoHocTap[lesson._id].state].text}</p>
                                </>;
                            }else{
                                return <p>Chưa hoàn thành</p>;
                            }
                        };
                        const content = (<div className='widget-small coloured-icon info'>
                            <i className='icon fa fa-3x fa fa-briefcase' style={{ backgroundColor: getBackgroundColor() }} />
                            <div className='info'>
                                <h4>{lesson && lesson.title}</h4>
                                {tienDoHocTap && tienDoHocTap[lesson._id] && tienDoHocTap[lesson._id].answers ?
                                    <div><p>Đã hoàn thành</p>{!monThucHanh && <p> Điểm ôn tập:{((tienDoHocTap[lesson._id].score ?
                                        tienDoHocTap[lesson._id].score : 0) + '/' + Math.min(lesson.numQuestion, Object.keys(tienDoHocTap[lesson._id].answers).length))}
                                        {(tienDoHocTap[lesson._id].diemTB && tienDoHocTap[lesson._id].diemTB >= 0.5) ? ' (Đạt)' : ' (Chưa đạt)'}</p>}</div>
                                    : ((lesson.questions.length && !monThucHanh) ? <p>Chưa hoàn thành</p> :
                                    //  (((tienDoHocTap && tienDoHocTap[lesson._id] && (tienDoHocTap[lesson._id].view || (tienDoHocTap[lesson._id].viewedVideo && lesson.videos && Object.keys(tienDoHocTap[lesson._id].viewedVideo).length == lesson.videos.length))) ? <p>Đã hoàn thành</p> : <p>Chưa hoàn thành</p>))
                                     getMonThucHanhStateText()
                                     )}
                            </div>
                        </div>);
                        const show = (
                            <div key={index} className='col-md-6'>
                                {
                                    finishedLesson < index ? content :
                                        <Link to={'/user/hoc-vien/khoa-hoc/' + this.state.courseId + '/mon-hoc/' + this.state.subjectId + '/bai-hoc/' + lesson._id}>
                                            {/* {content} */}
                                            {monThucHanh ? this.renderContentBaiHocThucHanh(lesson,tienDoHocTap,finishedLesson,index)
                                            :this.renderContentBaiHocLyThuyet(lesson,tienDoHocTap,finishedLesson,index)}
                                        </Link>
                                }
                            </div>);
                        return show;
                    }) : <div className='col-md-4'>Chưa có bài học</div>
                    }
                    {lessons && (tienDoHocTap && (Object.keys(tienDoHocTap).length >= lessons.length) && tienDoHocTap[Object.keys(tienDoHocTap)[lessons.length - 1]].diemTB >= 0.5) ?
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
                            {!monThucHanh && <>
                                <h4 style={{ width: '100%' }}>Thi hết môn</h4>
                                <Link className='col-md-6' to={'/user/hoc-vien/khoa-hoc/' + this.state.courseId + '/mon-hoc/thi-het-mon/' + this.state.subjectId}>
                                    <div className={'widget-small coloured-icon danger'} >
                                        <i className='icon fa fa-3x fa-pencil-square-o' style={{backgroundColor:'#3e24aa'}} />
                                        <div className='info'>
                                            <h4>Thi hết môn</h4>
                                            {tienDoThiHetMon ? <p>Điểm: {diemThiHetMon + ' (' + ((diemThiHetMon >= 5) ? 'Đạt) ' : 'Không đạt) ')}</p> : null}
                                        </div>
                                    </div>
                                </Link>
                            </>}
                        </> :
                        !monThucHanh && <>
                            <h4 style={{ width: '100%' }}>Thi hết môn</h4>
                            <Link className='col-md-6' onClick={() => T.alert('Vui lòng hoàn thành tất cả các bài học trước khi thi hết môn!', 'error', false, 8000)} >
                                <div className={'widget-small coloured-icon secondary'} >
                                    <i className='icon fa fa-3x fa-pencil-square-o' />
                                    <div className='info'>
                                        <h4 style={{ color: 'black' }}>Thi hết môn</h4>
                                    </div>
                                </div>
                            </Link>
                        </>
                    }
                </div>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.trainning.subject });
const mapActionsToProps = { getSubjectByStudent, getStudentScore, getStudentSubjectScore };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);
