import React from 'react';
import { connect } from 'react-redux';
import { getCourse, updateCourse } from '../redux';
import { ajaxSelectSubject } from 'modules/mdDaoTao/fwSubject/redux';
import { AdminModal, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';

class SubjectModal extends AdminModal {
    componentDidMount() {
        this.itemSubject.value(null);
    }

    onSubmit = () => {
        const subjects = this.props.subjects ? [...this.props.subjects] : [],
            subjectId = this.itemSubject.value();
        if (!subjects.contains(subjectId)) {
            subjects.push(subjectId);
            this.props.update(this.props._id, { subjects }, this.hide);
        } else {
            this.hide();
        }
    }

    render = () => this.renderModal({
        title: 'Thêm môn học',
        body: <FormSelect ref={e => this.itemSubject = e} label='Môn học' data={ajaxSelectSubject} />,
    });
}

class AdminSubjectView extends React.Component {
    state = {};

    removeSubject = (e, index) => e.preventDefault() || T.confirm('Xoá môn học ', 'Bạn có chắc muốn xoá môn học khỏi khóa học này?', true, isConfirm => {
        if (isConfirm && this.props.course && this.props.course.item) {
            const { _id, subjects = [] } = this.props.course.item;
            subjects.splice(index, 1);
            this.props.updateCourse(_id, { subjects: subjects.length ? subjects : 'empty' });
        }
    });

    addSubject = e => e.preventDefault() || this.modal.show();

    render() {
        const permission = this.props.permission || {},
            item = this.props.course && this.props.course.item ? this.props.course.item : { subjects: [] };
        const table = renderTable({
            getDataSource: () => item.subjects && item.subjects.sort((a, b) => a.title.localeCompare(b.title)),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '100%' }}>Tên môn học</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số bài học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/dao-tao/mon-hoc/edit/' + item._id} />
                    <TableCell type='number' content={item.lessons ? item.lessons.length : 0} />
                    <TableCell type='buttons' content={item} permission={permission} onDelete={e => this.removeSubject(e, index)} />
                </tr>),
        });

        return <>
            <div className='tile-body'>{table}</div>
            <SubjectModal ref={e => this.modal = e} update={this.props.updateCourse} _id={item._id} subjects={item.subjects || []} />
            {permission.write ?
                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.addSubject}>
                    <i className='fa fa-lg fa-plus' />
                </button> : null}
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getCourse, updateCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminSubjectView);
