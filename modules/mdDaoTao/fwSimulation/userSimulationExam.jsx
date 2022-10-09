import React from 'react';
import { connect } from 'react-redux';
import { getSimulatorRandom } from './redux';
import { getCourseByStudent } from '../fwCourse/redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import YouTube from 'react-youtube';

class AdminEditPage extends AdminPage {
    state = {result:{1: 0}, isLastVideo: false};
    componentDidMount() {
        window.addEventListener('keydown', this.logKey);
        let url = window.location.pathname,
            params = T.routeMatcher('/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/mo-phong/kiem-tra').parse(url);
        this.setState({ courseId: params.courseId });
        this.props.getCourseByStudent(params.courseId, data => {
            if (data.error) {
                T.notify('Lấy khoá học bị lỗi!', 'danger');
                this.props.history.push('/user/hoc-vien/khoa-hoc/:courseId');
            } else if (data.item) {
                this.props.getSimulatorRandom({},(simulators) => {
                    if (simulators && simulators.error) {
                        this.props.history.push('/user');
                    } else {
                        if (simulators && simulators.length == 1) {
                            this.setState({ prevButton: 'invisible', nextButton: 'invisible' });
                        } else {
                            this.setState({ prevButton: 'invisible' });
                        }
                        this.setState({ student: data.student, courseTypeId: data.item.courseType._id, activeQuestionIndex: 0, questions: simulators, courseId: data.item._id});
                    }
                });
                T.ready('/user/hoc-vien/khoa-hoc/' + this.state.courseId);
            } else {
                this.props.history.push('/user');
            }
        });
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.logKey);
    }

    logKey = (e) => {
        const { activeQuestionIndex, isAnswer, questions} = this.state,
            maxIndex = this.state.questions.length - 1;
            let result = this.state.result;
        if (e.code == 'ArrowRight' && activeQuestionIndex < maxIndex) {
            this.changeQuestion(e, this.state.activeQuestionIndex + 1);
        } else if (e.code == 'ArrowLeft' && activeQuestionIndex > 0) {
            this.changeQuestion(e, this.state.activeQuestionIndex - 1);
        } else if (e.code == 'Space') {
            e.preventDefault();
            if(!isAnswer){
                const answer = (this.state.currentTime % 60).toFixed(0),
                { minPointAnswer, maxPointAnswer, _id} = questions[activeQuestionIndex],
                distance = (minPointAnswer - maxPointAnswer + 1)/5;
                if(answer <maxPointAnswer || answer >minPointAnswer){
                    result[activeQuestionIndex] = 0;
                    $('#' + _id).text('0 điểm').css('color', 'black');
                } else if(answer<maxPointAnswer+distance) {
                    result[activeQuestionIndex] = 5;
                    $('#' + _id).text('5 điểm').css('color', 'black');
                }
                else if(answer<maxPointAnswer+distance*2) {
                    result[activeQuestionIndex] = 4;
                    $('#' + _id).text('4 điểm').css('color', 'black');
                }
                else if(answer<maxPointAnswer+distance*3) {
                    result[activeQuestionIndex] = 3;
                    $('#' + _id).text('3 điểm').css('color', 'black');
                }
                else if(answer<maxPointAnswer+distance*4) {
                    result[activeQuestionIndex] = 2;
                    $('#' + _id).text('2 điểm').css('color', 'black');
                }
                else {
                    result[activeQuestionIndex] = 1;
                    $('#' + _id).text('1 điểm').css('color', 'black');
                }
                this.setState({isAnswer: true, time: answer, result});
            }
            //$('#traLoi').text('Bạn đã trả lời tại lượt xem này rồi, vui lòng chờ hết video để trả lời lại!').css('color', 'red');
            
        }
    }

    onClickVideo = () => {
        const { activeQuestionIndex, questions, isAnswer} = this.state;
        let result = this.state.result;
            if(!isAnswer){
                const answer = (this.state.currentTime % 60).toFixed(0),
                { minPointAnswer, maxPointAnswer, _id} = questions[activeQuestionIndex],
                distance = (minPointAnswer - maxPointAnswer + 1)/5;
                if(answer <maxPointAnswer || answer >minPointAnswer){
                    result[activeQuestionIndex] = 0;
                    $('#' + _id).text('0 điểm').css('color', 'black');
                } else if(answer<maxPointAnswer+distance) {
                    result[activeQuestionIndex] = 5;
                    $('#' + _id).text('5 điểm').css('color', 'black');
                }
                else if(answer<maxPointAnswer+distance*2) {
                    result[activeQuestionIndex] = 4;
                    $('#' + _id).text('4 điểm').css('color', 'black');
                }
                else if(answer<maxPointAnswer+distance*3) {
                    result[activeQuestionIndex] = 3;
                    $('#' + _id).text('3 điểm').css('color', 'black');
                }
                else if(answer<maxPointAnswer+distance*4) {
                    result[activeQuestionIndex] = 2;
                    $('#' + _id).text('2 điểm').css('color', 'black');
                }
                else {
                    result[activeQuestionIndex] = 1;
                    $('#' + _id).text('1 điểm').css('color', 'black');
                }
                this.setState({isAnswer: true, time: answer, result});
            } else T.alert('Bạn đã trả lời tại lượt xem này rồi, vui lòng chờ hết video để trả lời lại!', 'error', false, 2500);
            //$('#traLoi').text('Bạn đã trả lời tại lượt xem này rồi, vui lòng chờ hết video để trả lời lại!').css('color', 'red');
    }

    onStateChange(event) {
        const { activeQuestionIndex, questions, result} = this.state,
        { _id} = questions[activeQuestionIndex];
        if (event.data == 1) {
                this.intervalVideo = setInterval(() => {
                    this.setState({currentTime: event.target.getCurrentTime()});
                }, 1000);
        } else if (event.data == -1 || event.data == 0) {
            this.setState({isAnswer: false});
            $('#' + _id).text('Chưa có').css('color', 'black');
            clearInterval(this.intervalVideo);
            this.intervalVideo = null;
            if(activeQuestionIndex < questions.length - 1) this.changeQuestion(null, activeQuestionIndex + 1);
            else{
                const score = Object.values(result).reduce((prev, next) => prev + next);
                event.target.pauseVideo();
                this.setState({isLastVideo: true});
                const successContent = `<h5 style='color:#199D76'><b>Bạn đã hoàn thành bài kiểm tra</b></h5>
                <p style='color:#333'>Số điểm của bạn là ${score}</p>
                <p style='color:#333'>Kết quả của bài kiểm tra của bạn là: <span style='color:green'>Đạt</span>.</p>
                <p style='color:#333'> Xin chúc mừng!</p>`;
                const failContent = `<h5 style='color:red'><b>Bạn đã hoàn thành bài kiểm tra</b></h5>
                <p style='color:#333'>Số điểm của bạn là ${score}</p>
                <p style='color:#333'>Kết quả của bài kiểm tra của bạn là: <span style='color:red'>Chưa đạt</span>. </p>
                <p style='color:#333'>Chúc bạn làm lại bài kiểm tra tốt hơn!</p>`;
                if(score >= 35) T.alert(successContent, 'success', true, 15000);
                else T.alert(failContent, 'error', true, 15000);
            }
        }
    }

    changeQuestion = (e, index) => {
        const { activeQuestionIndex, questions} = this.state,
        { _id} = questions[activeQuestionIndex];
        e && e.preventDefault();
        clearInterval(this.intervalVideo);
        this.intervalVideo = null;
        $('#' + _id).text('Chưa có').css('color', 'black');
        this.setState({ activeQuestionIndex: index, isAnswer: false });
    }

    render() {
        const questions = this.props.simulator ? this.props.simulator.list : [];
        const activeQuestionIndex = this.state.activeQuestionIndex ? this.state.activeQuestionIndex : 0;
        const activeQuestion = questions ? questions[activeQuestionIndex] : null;
        const {isAnswer, time, isLastVideo, result} = this.state;
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId ;
        const score = Object.values(result).reduce((prev, next) => prev + next);
        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Mô phỏng: Kiểm tra',
            breadcrumb: [<Link key={0} to={userPageLink}>Khóa học</Link>, <Link key={1} to={userPageLink + '/mon-hoc/mo-phong'}>Mô phỏng</Link>, 'Kiểm tra'],
            content: (
            <>
                {questions && questions.length ? (
                    <div className='tile'>
                        <div className='tile-body'>
                            {activeQuestion ? (
                            <div className='row'>
                                <div className='col-md-12 pb-5'>
                                    <div className='row'>
                                        <div className='col-md-8'>
                                            <h6>Câu hỏi {activeQuestionIndex + 1 + '/' + questions.length}: </h6>
                                        </div>
                                    </div>
                                    <div className='pb-5 row'>
                                        <div className='col-md-8'>
                                            <div className='d-flex justify-content-center'>
                                                <div className='embed-responsive embed-responsive-16by9' style={{ width: '100%', display: 'block' }} >
                                                    <YouTube id={activeQuestion._id + 'video'} opts={{ playerVars: { 'autoplay': 1, 'controls': 0, 'rel': 0, 'modestbranding': 1, 'showinfo': 0, 'loop': 1, 'playlist':activeQuestion.link, 'disablekb': 1 } }} videoId={activeQuestion.link} onStateChange={(e) => this.onStateChange(e)} containerClassName='embed embed-youtube' />
                                                </div>
                                            </div>
                                            <div className='d-flex justify-content-center pt-2 pb-2'>
                                                {!isLastVideo ? <button className={'btn mr-1 ' + (isAnswer ? 'btn-secondary' : 'btn-warning')} onClick={() => isAnswer ? null : this.onClickVideo()}>Nhấn nút này hoặc ấn phím cách để đánh dấu</button>:
                                                <button className={'btn mr-1 btn-success'} onClick={() => window.location.reload()}>Làm lại</button>}
                                            </div>
                                            {/* <p className='text-center' >Điểm: <span id={activeQuestion._id} ></span></p> */}
                                            {/* <p id='traLoi' className='text-center' ></p> */}
                                            {/* <nav aria-label='...' className='d-flex justify-content-center pt-2' >
                                                <ul className='pagination'>
                                                    <li className={'page-item ' + this.state.prevButton} id='prev-btn'>
                                                        <a role='button' className='page-link' onClick={e => this.changeQuestion(e, activeQuestionIndex - 1)}><i className='fa fa-arrow-left' aria-hidden='true' />Câu trước</a>
                                                    </li>
                                                    <li className={'page-item ' + this.state.nextButton} id='next-btn'>
                                                        <a role='button' className='page-link' onClick={e => this.changeQuestion(e, activeQuestionIndex + 1)}> Câu tiếp <i className='fa fa-arrow-right' aria-hidden='true' /></a>
                                                    </li>
                                                </ul>
                                            </nav> */}
                                            <div className='row'>
                                                    {/* <div className='col-md-7'>
                                                        <h5>Phương pháp chấm điểm: </h5>
                                                        <p>*Trong mỗi tình huống có 02 mốc thời điểm 5đ và 0đ:</p>
                                                        <p className='ml-2'>- 5 điểm: thời điểm bắt đầu có dấu hiệu phát hiện ra tình huống nguy hiểm, lái xe cần xử lý.</p>
                                                        <p className='ml-2'>- 0 điểm: mốc thời điểm mà xử lý từ thời điểm này vẫn xảy ra tai nạn.</p>
                                                        <p>*Học viên lựa chọn được giữa 2 mốc này sẽ đạt mức điểm tương ứng từ 5-4-3-2-1 điểm</p>
                                                    </div> */}
                                                    {/* <div className='col-md-5 '>
                                                        <h5>Kết quả tình huống của bạn: </h5>
                                                        <p>*Tình huống số: {activeQuestionIndex+1}</p>
                                                        <p>*Thời điểm gắn cờ: {isAnswer ? time+'s' : 'Chưa có'}</p>
                                                        <p>*Kết quả: <span id={activeQuestion._id} >Chưa có</span></p>
                                                    </div> */}
                                            </div>
                                           
                                        </div>
                                        <div className='col-md-4 border-left border-dark'>
                                            <h5>Kết quả tình huống của bạn: </h5>
                                            <p>*Tình huống số: {activeQuestionIndex+1}</p>
                                            <p>*Thời điểm gắn cờ: {isAnswer ? time+'s' : 'Chưa có'}</p>
                                            <p>*Kết quả: <span id={activeQuestion._id} >Chưa có</span></p>
                                            <p>*Điểm của bạn: {score}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>) : null}
                        </div>
                    </div>
                ) : <div className='tile'>Không có câu hỏi</div>}
            </>
              
            ),
            backRoute: '/user/hoc-vien/khoa-hoc/' + this.state.courseId,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, simulator: state.training.simulator });
const mapActionsToProps = { getSimulatorRandom, getCourseByStudent };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);
