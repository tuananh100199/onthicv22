import React from 'react';
import { connect } from 'react-redux';
import { getStudentFeedback, sendFeedback } from 'modules/mdDaoTao/fwStudent/redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormRichTextBox } from 'view/component/AdminPage';

class UserCourseFeedback extends AdminPage {
    state = {};
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id/phan-hoi'),
            _id = route.parse(window.location.pathname)._id;
        if (_id) {
            this.setState({ courseId: _id });
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getStudentFeedback(_id, data => {
                    if (data.error) {
                        this.props.history.push(`/user/hoc-vien/khoa-hoc/${this.state.courseId}`);
                    }
                });
            });
        } else {
            this.props.history.push(`/user/hoc-vien/khoa-hoc/${this.state.courseId}`);
        }
    }

    sendFeedback = (_id) => {
        const title = this.newFeedback.value();
        this.props.sendFeedback(_id, title, () => {
            this.props.getStudentFeedback(this.state.courseId);
            this.newFeedback.value('');
        });
    }

    render() {
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId,
            student = this.props.student && this.props.student.item;
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học: ' + (student && student.course && student.course.name || '...'),
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, 'Phản hồi khóa học'],
            content: (
                <div className='tile'>
                    <h3 className='tile-title'>Phản hồi khóa học</h3>
                    <div className='tile-body'>
                        {student && student.courseFeedbacks.length ? student.courseFeedbacks.map((item, index) => <div key={index} style={{ margin: 10 }}>
                            <div className='row'>
                                <div className='col-md-1' >
                                    <img src={student.image || student.user && student.user.image} style={{ height: '40px', borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5 }} alt='no image'></img>
                                </div>
                                <div className='col-md-11' style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5 }}>
                                    <div className=''>
                                        <b>{`${student.lastname} ${student.firstname}`}</b> (Bạn):
                                        <label style={{ float: 'right' }}>
                                            {T.dateToText(item.createdDate)}
                                        </label>
                                    </div>
                                    <div className=''>
                                        {item.title}
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: 10 }}>
                                {item.replies.length ? item.replies.map((reply, index) => <div className='row' style={{ margin: 10 }} key={index}>
                                    <div className='col-md-1'>
                                        <i className='fa fa-share'></i>
                                    </div>
                                    <div className='col-md-1'>
                                        <img src={reply._adminId ? reply._adminId.image : (student.image || student.user && student.user.image)} style={{ height: '40px', borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5 }} alt='no image'></img>
                                    </div>
                                    <div className='col-md-10' style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5 }}>
                                        <div className=''>
                                            <b>{reply._adminId ? `${reply._adminId.lastname} ${reply._adminId.firstname}` : `${student.lastname} ${student.firstname}`}</b>
                                            {reply._adminId ? ' (Quản trị khóa học)' : ' (Bạn)'}:
                                            <label style={{ float: 'right' }}>
                                                {T.dateToText(reply.createdDate)}
                                            </label>
                                        </div>
                                        <div className=''>
                                            {reply.content}
                                        </div>
                                    </div>
                                </div>) : 'Chưa có phản hồi từ quản trị khóa học'}
                            </div>
                        </div>) : 'Chưa có phản hồi'}

                    </div>
                    <div className='tile-footer'>
                        <div className='row'>
                            <FormRichTextBox ref={e => this.newFeedback = e} className='col-md-11' style={{ display: 'flex' }} />
                            <div className='col-md-1'>
                                <button className='btn btn-primary' type='button' onClick={() => this.sendFeedback(student._id)}> Gửi </button>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getStudentFeedback, sendFeedback };
export default connect(mapStateToProps, mapActionsToProps)(UserCourseFeedback);
