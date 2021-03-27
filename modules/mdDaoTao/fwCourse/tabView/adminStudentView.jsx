import React from 'react';
import { connect } from 'react-redux';
import { getCourse, updateCourse } from '../redux';
import { AdminModal, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';

class AdminStudentView extends React.Component {
    state = {};

    render() {
        const permission = this.props.permission || {},
            item = this.props.course && this.props.course.item ? this.props.course.item : { groups: [] };

        return (
            <div className='tile-body'>
                Học viên
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getCourse, updateCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);
