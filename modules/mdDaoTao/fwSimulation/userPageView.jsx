import React from 'react';
import { connect } from 'react-redux';
import { getSimulatorAll } from './redux';
import { getCourseByStudent } from '../fwCourse/redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormTextBox } from 'view/component/AdminPage';
import YouTube from 'react-youtube';

class HintModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
        
    }

    onShow = (item) => {
        const { _id, title, image } = item || { _id: null, title: '' };
        this.itemTitle.value(title);
        this.setState({ _id, image});
    }

    render = () => this.renderModal({
        title: 'Gợi ý',
        size: 'large',
        body: 
            <>
                <FormTextBox className='d-flex justify-content-center' ref={e => this.itemTitle = e} label='Tên bài mô phỏng' readOnly={true} />
                <div className='d-flex justify-content-center'>
                    <img  alt='Gợi ý' style={{width: '80%'}} src={this.state.image||''}></img>
                </div>
                
            </>,
    });
}

class AdminEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        window.addEventListener('keydown', this.logKey);
        let url = window.location.pathname,
            params = T.routeMatcher('/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/mo-phong').parse(url);
        this.setState({ courseId: params.courseId });
        this.props.getCourseByStudent(params.courseId, data => {
            if (data.error) {
                T.notify('Lấy khoá học bị lỗi!', 'danger');
                this.props.history.push('/user/hoc-vien/khoa-hoc/:courseId');
            } else if (data.item) {
                this.props.getSimulatorAll({},(simulators) => {
                    if (simulators && simulators.error) {
                        this.props.history.push('/user');
                    } else {
                        if (simulators && simulators.length == 1) {
                            this.setState({ prevButton: 'invisible', nextButton: 'invisible' });
                        } else {
                            this.setState({ prevButton: 'invisible' });
                        }
                        this.setState({ student: data.student, courseTypeId: data.item.courseType._id, activeQuestionIndex: 0, questions: simulators});
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
                    $('#' + _id).text('0 điểm').css('color', 'black');
                } else if(answer<maxPointAnswer+distance) $('#' + _id).text('5 điểm').css('color', 'black');
                else if(answer<maxPointAnswer+distance*2) $('#' + _id).text('4 điểm').css('color', 'black');
                else if(answer<maxPointAnswer+distance*3) $('#' + _id).text('3 điểm').css('color', 'black');
                else if(answer<maxPointAnswer+distance*4) $('#' + _id).text('2 điểm').css('color', 'black');
                else $('#' + _id).text('1 điểm').css('color', 'black');
                this.setState({isAnswer: true, time: answer});
            } else T.alert('Bạn đã trả lời tại lượt xem này rồi, vui lòng chờ hết video để trả lời lại!', 'error', false, 2500);
            //$('#traLoi').text('Bạn đã trả lời tại lượt xem này rồi, vui lòng chờ hết video để trả lời lại!').css('color', 'red');
            
        }
    }

    onClickVideo = () => {
        const { activeQuestionIndex, questions, isAnswer} = this.state;
            if(!isAnswer){
                const answer = (this.state.currentTime % 60).toFixed(0),
                { minPointAnswer, maxPointAnswer, _id} = questions[activeQuestionIndex],
                distance = (minPointAnswer - maxPointAnswer + 1)/5;
                if(answer <maxPointAnswer || answer >minPointAnswer){
                    $('#' + _id).text('0 điểm').css('color', 'black');
                } else if(answer<maxPointAnswer+distance) $('#' + _id).text('5 điểm').css('color', 'black');
                else if(answer<maxPointAnswer+distance*2) $('#' + _id).text('4 điểm').css('color', 'black');
                else if(answer<maxPointAnswer+distance*3) $('#' + _id).text('3 điểm').css('color', 'black');
                else if(answer<maxPointAnswer+distance*4) $('#' + _id).text('2 điểm').css('color', 'black');
                else $('#' + _id).text('1 điểm').css('color', 'black');
                this.setState({isAnswer: true, time: answer});
            } else T.alert('Bạn đã trả lời tại lượt xem này rồi, vui lòng chờ hết video để trả lời lại!', 'error', false, 2500);
            //$('#traLoi').text('Bạn đã trả lời tại lượt xem này rồi, vui lòng chờ hết video để trả lời lại!').css('color', 'red');
    }

    onStateChange(event) {
        const { activeQuestionIndex, questions} = this.state,
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
        }
    }

    changeQuestion = (e, index) => {
        const { activeQuestionIndex, questions} = this.state,
        { _id} = questions[activeQuestionIndex];
        e.preventDefault();
        clearInterval(this.intervalVideo);
        this.intervalVideo = null;
        $('#' + _id).text('Chưa có').css('color', 'black');
        this.setState({ activeQuestionIndex: index, isAnswer: false }, () => {
            const activeQuestion = questions[index];
            if (activeQuestion) {
                if (index == 0 && questions.length != 1) {
                    this.setState({ prevButton: 'invisible', nextButton: 'visible' });
                } else if (questions.length == 2 && index == 1) {
                    this.setState({ prevButton: 'visible', nextButton: 'invisible' });
                } else if (index == questions.length - 1) {
                    this.setState({ nextButton: 'invisible' });
                } else {
                    this.setState({ nextButton: 'visible', prevButton: 'visible' });
                }
            }
        });
    }

    render() {
        const questions = this.props.simulator ? this.props.simulator.list : [];
        const activeQuestionIndex = this.state.activeQuestionIndex ? this.state.activeQuestionIndex : 0;
        const activeQuestion = questions ? questions[activeQuestionIndex] : null;
        const {isAnswer, time} = this.state;
        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Mô phỏng',
            breadcrumb: [<Link key={0} to={'/user'}>Khóa học</Link>, 'Môn học'],
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
                                            <h6>{activeQuestion.title}</h6>
                                        </div>
                                    </div>
                                    <div className='pb-5 row'>
                                        <div className='col-md-8'>
                                            <div className='d-flex justify-content-center'>
                                                <div className='embed-responsive embed-responsive-16by9' style={{ width: '100%', display: 'block' }} >
                                                    <YouTube id={activeQuestion._id + 'video'} opts={{ playerVars: { 'autoplay': 1, 'controls': 0, 'rel': 0, 'modestbranding': 1, 'showinfo': 0, 'loop': 1, 'playlist':activeQuestion.link, 'disablekb': 1 } }} videoId={activeQuestion.link} onStateChange={(e) => this.onStateChange(e)} containerClassName='embed embed-youtube' />
                                                </div>
                                            </div>
                                            <div className='d-flex justify-content-center pt-2'>
                                                <button className='btn btn-warning mr-1' onClick={() => this.onClickVideo()}>Nhấn hoặc ấn phím cách để đánh dấu</button>
                                                <button className='btn btn-success' onClick={() => {
                                                        this.modal.show(activeQuestion);
                                                    }}><span><i className="fa fa-search" aria-hidden="true"></i></span> Gợi ý </button>
                                            </div>
                                            {/* <p className='text-center' >Điểm: <span id={activeQuestion._id} ></span></p> */}
                                            {/* <p id='traLoi' className='text-center' ></p> */}
                                            <nav aria-label='...' className='d-flex justify-content-center pt-2' >
                                                <ul className='pagination'>
                                                    <li className={'page-item ' + this.state.prevButton} id='prev-btn'>
                                                        <a role='button' className='page-link' onClick={e => this.changeQuestion(e, activeQuestionIndex - 1)}><i className='fa fa-arrow-left' aria-hidden='true' />Câu trước</a>
                                                    </li>
                                                    <li className={'page-item ' + this.state.nextButton} id='next-btn'>
                                                        <a role='button' className='page-link' onClick={e => this.changeQuestion(e, activeQuestionIndex + 1)}> Câu tiếp <i className='fa fa-arrow-right' aria-hidden='true' /></a>
                                                    </li>
                                                </ul>
                                            </nav>
                                            <div className='row'>
                                                    <div className='col-md-7'>
                                                        <h5>Phương pháp chấm điểm: </h5>
                                                        <p>*Trong mỗi tình huống có 02 mốc thời điểm 5đ và 0đ:</p>
                                                        <p className='ml-2'>- 5 điểm: thời điểm bắt đầu có dấu hiệu phát hiện ra tình huống nguy hiểm, lái xe cần xử lý.</p>
                                                        <p className='ml-2'>- 0 điểm: mốc thời điểm mà xử lý từ thời điểm này vẫn xảy ra tai nạn.</p>
                                                        <p>*Học viên lựa chọn được giữa 2 mốc này sẽ đạt mức điểm tương ứng từ 5-4-3-2-1 điểm</p>
                                                    </div>
                                                    <div className='col-md-5 border-left border-dark'>
                                                        <h5>Kết quả tình huống của bạn: </h5>
                                                        <p>*Tình huống số: {activeQuestionIndex+1}</p>
                                                        <p>*Thời điểm gắn cờ: {isAnswer ? time+'s' : 'Chưa có'}</p>
                                                        <p>*Kết quả: <span id={activeQuestion._id} >Chưa có</span></p>
                                                    </div>
                                            </div>
                                           
                                        </div>
                                        <div className='col-md-4'>
                                            <h5>Danh sách câu hỏi</h5>
                                            <div className='d-flex justify-content-between'>
                                                <div>
                                                    {questions.map((question, index) => (<button key={index} className={'m-1 btn ' + (activeQuestionIndex == index ? 'btn-success': 'btn-primary') } style={{ cursor: 'pointer', border:'1px solid black', borderRadius: '15px', width:'50px' }} onClick={e => this.changeQuestion(e, index)}>{index+1}</button>))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>) : null}
                        </div>
                    </div>
                ) : <div className='tile'>Không có câu hỏi</div>}
                <HintModal ref={e => this.modal = e}/>
            </>
              
            ),
            backRoute: '/user/hoc-vien/khoa-hoc/' + this.state.courseId,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, simulator: state.training.simulator });
const mapActionsToProps = { getSimulatorAll, getCourseByStudent };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);
