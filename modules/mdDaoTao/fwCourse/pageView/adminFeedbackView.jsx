import React from 'react';
import FeedbackSection from 'modules/mdTruyenThong/fwFeedback/FeedbackAdminSection';
import { FormCheckbox } from 'view/component/AdminPage';

export default class AdminFeedbackView extends React.Component {
    state = {};
    onChange = (value, type) => {
        if (value) {
            this.setState({ type });
            this[type == 'course' ? 'teacher' : 'course'].value(false);
        }
    }
    render() {
        return <>
            <div style={{ display: 'flex' }}>
            <FormCheckbox ref={e => this.course = e} onChange={value => this.onChange(value, 'course')} label='Phản hồi khóa học' />
            &nbsp; &nbsp;
            <FormCheckbox ref={e => this.teacher = e} onChange={value => this.onChange(value, 'teacher')} label='Phản hồi cố vấn học tập' />
            </div>
            {this.state.type && <FeedbackSection type={this.state.type} _refId={this.props.courseId} />}
        </>;
    }
}
