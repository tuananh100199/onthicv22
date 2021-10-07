import React from 'react';
import { connect } from 'react-redux';
import { getCourseByStudent } from './redux.jsx';
import FeedbackSection from 'modules/mdTruyenThong/fwFeedback/FeedbackUserSection';
import { AdminPage,FormCheckbox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class UserCourseFeedback extends AdminPage {
    state = {};
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id/phan-hoi'),
            _id = route.parse(window.location.pathname)._id;
        if (_id) {
            this.setState({ courseId: _id });
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getCourseByStudent(_id, data => {
                    if (data.error) {
                        this.props.history.push(`/user/hoc-vien/khoa-hoc/${this.state.courseId}`);
                    } else this.setState({name:data.item && data.item.name});
                });
            });
        } else {
            this.props.history.push(`/user/hoc-vien/khoa-hoc/${this.state.courseId}`);
        }
    }

    onChange =(value,type)=>{
        if (value){
            this.setState({type});
            this[type=='course'?'teacher':'course'].value(false);
        }
    }
    render() {
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId;
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học: ' + (this.state.name || '...'),
            breadcrumb: [<Link key={0} to={userPageLink}>Khóa học của tôi</Link>, 'Phản hồi khóa học'],
            content: <>
            <div className='tile' style={{display:'flex'}}>
            <FormCheckbox ref={e=>this.course=e} onChange={value=>this.onChange(value,'course')} label='Phản hồi khóa học'/>
            &nbsp;
            <FormCheckbox ref={e=>this.teacher=e} onChange={value=>this.onChange(value,'teacher')} label='Phản hồi cố vấn học tập'/>
            </div>
            {this.state.type && <FeedbackSection type={this.state.type} _refId={this.state.courseId} title={this.state.type == 'teacher'?'cố vấn học tập':'khóa học'} />}
        </>,
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system,course: state.trainning.course });
const mapActionsToProps = { getCourseByStudent };
export default connect(mapStateToProps, mapActionsToProps)(UserCourseFeedback);
