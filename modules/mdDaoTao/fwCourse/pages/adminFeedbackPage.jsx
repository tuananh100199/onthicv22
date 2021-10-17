import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCourse } from '../redux';
import FeedbackSection from 'modules/mdTruyenThong/fwFeedback/FeedbackAdminSection';
import { AdminPage, FormCheckbox } from 'view/component/AdminPage';

export class AdminFeedbackPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/feedback').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (!course) {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        }
                    });
                    this.course.value(true);
                    this.onChange(true, 'course');
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    onChange = (value, type) => {
        if (value) {
            this.setState({ type });
            this[type == 'course' ? 'teacher' : 'course'].value(false);
        }
    }

    render() {
        const item = this.props.course && this.props.course.item ? this.props.course.item : {};
        const backRoute = `/user/course/${item._id}`;
        return this.renderPage({
            icon: 'fa fa-line-chart',
            title: 'Phản hồi: ' + item.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={backRoute}>{item.name}</Link> : '', 'Phản hồi'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>
                        <div style={{ display: 'flex' }}>
                            <FormCheckbox ref={e => this.course = e} onChange={value => this.onChange(value, 'course')} label='Phản hồi khóa học' />&nbsp; &nbsp; &nbsp; &nbsp;
                            <FormCheckbox ref={e => this.teacher = e} onChange={value => this.onChange(value, 'teacher')} label='Phản hồi cố vấn học tập' />
                        </div>
                        {this.state.type && <FeedbackSection type={this.state.type} _refId={item._id} />}
                    </div>
                </div>),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminFeedbackPage);