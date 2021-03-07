import React from 'react';
import { connect } from 'react-redux';
import { getCourse } from './redux.jsx';
import SubMenusPage from '../../view/component/SubMenusPage.jsx';

class AdminOverviewCourse extends React.Component {
    state = { item: null };

    componentDidMount() {
        T.ready('/user/course/list', () => {
            const route = T.routeMatcher('/user/course/item/:courseId'),
                courseId = route.parse(window.location.pathname).courseId;
            this.props.getCourse(courseId, data => {
                if (data.error) {
                    T.notify('Lấy khóa học bị lỗi!', 'danger');
                    this.props.history.push('/user/course/list');
                } else if (data.item) {
                    this.setState(data);
                    console.log("state", this.state)
                } else {
                    this.props.history.push('/user/course/list');
                }
            });
        });
    }
    render() {
        return (
            <SubMenusPage menuLink='/user/course/item/:courseId' menuKey={7000} headerIcon='fa fa-file'
                customTitle={this.state.item ? this.state.item.title : ''} customBelowTitle={this.state.item ? this.state.item.licenseClass : ''} />
        );
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminOverviewCourse);
