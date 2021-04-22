import React from 'react';
import { connect } from 'react-redux';
import { getStudentCourse } from './redux';
import { AdminPage } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class UserCoursePage extends AdminPage {
    componentDidMount() {
        this.props.getStudentCourse();
        T.ready('/user/hoc-vien/khoa-hoc');
    }

    render() {
        const list = this.props.course && this.props.course.item ? this.props.course.item : [];

        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học',
            breadcrumb: ['Khóa học'],
            content: (
                <div className='row'>
                    {list.length && list.map((course, index) => (
                        <div key={index} className='col-md-12 col-lg-6'>
                            <Link to={'/user/hoc-vien/khoa-hoc/' + course._id}>
                                <div className='widget-small coloured-icon info'>
                                    <i className='icon fa fa-3x fa fa-cubes' />
                                    <div className='info'>
                                        <h4>Khóa học hạng {course && course.courseType ? course.courseType.title : ''}</h4>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))
                    }
                </div>),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getStudentCourse };
export default connect(mapStateToProps, mapActionsToProps)(UserCoursePage);
