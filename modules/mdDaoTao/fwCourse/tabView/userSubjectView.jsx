import React from 'react';
import { connect } from 'react-redux';
import { getCourse, updateCourse } from '../redux';
import { TableCell, renderTable } from 'view/component/AdminPage';

class AdminSubjectView extends React.Component {

    render() {
        const item = this.props.course && this.props.course.item ? this.props.course.item : { subjects: [] };
        const table = renderTable({
            getDataSource: () => item && item.subjects && item.subjects.sort((a, b) => a.title.localeCompare(b.title)),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '100%' }}>Tên môn học</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số bài học</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/hoc-vien/khoa-hoc/mon-hoc/' + item._id} />
                    <TableCell type='number' content={item.lessons ? item.lessons.length : 0} />
                </tr>),
        });

        return (
            <div className='tile-body'>
                {table}
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, updateCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminSubjectView);
