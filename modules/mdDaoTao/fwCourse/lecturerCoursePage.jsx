import React from 'react';
import { connect } from 'react-redux';
import { getCourseTypeAll } from '../fwCourseType/redux';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import LecturerCourseFilterView from './tabView/lecturerCourseFilterView';

class CoursePage extends AdminPage {
    state = {};
    componentDidMount() {
        this.props.getCourseTypeAll(list => {
            const courseTypes = list.map(item => ({ id: item._id, text: item.title }));
            this.setState({ courseTypes });
        });
        T.ready();
    }

    render() {
        const courseTypes = this.state.courseTypes ? this.state.courseTypes : [];
        const tabs = courseTypes.length ? courseTypes.map(courseType => ({ title: courseType.text, component: <LecturerCourseFilterView courseFilter={courseType.course} courseType={courseType.id} /> })) : [];
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học',
            breadcrumb: ['Khóa học'],
            content: <>
                <FormTabs id='coursePageTab' contentClassName='tile' tabs={tabs} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getCourseTypeAll };
export default connect(mapStateToProps, mapActionsToProps)(CoursePage);
