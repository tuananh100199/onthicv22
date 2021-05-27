import React from 'react';
import { connect } from 'react-redux';
import { getCourse, updateCourse } from '../../fwCourse/redux';
import { TableCell, renderTable } from 'view/component/AdminPage';

class AdminSubjectView extends React.Component {
    addSubject = e => e.preventDefault() || this.modal.show();

    removeSubject = (e, index) => e.preventDefault() || T.confirm('Xoá môn học', 'Bạn có chắc muốn xoá môn học khỏi khóa học này?', true, isConfirm => {
        if (isConfirm && this.props.course && this.props.course.item) {
            const { _id, subjects = [] } = this.props.course.item;
            subjects.splice(index, 1);
            this.props.updateCourse(_id, { subjects: subjects.length ? subjects : 'empty' });
        }
    });

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
                    <TableCell type='link' content={item.title} url={'/user/dao-tao/mon-hoc/' + item._id} />
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
