import React from 'react';
import { connect } from 'react-redux';
import { getCourse, updateCourse } from '../redux';
import { ajaxSelectSubject } from 'modules/mdDaoTao/fwSubject/redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';

class SubjectModal extends AdminModal {
    componentDidMount() {
        this.itemSubject.value(null);
    }

    onSubmit = () => {
        const subjects = this.props.subjects ? [...this.props.subjects].map(item => item._id) : [],
            _subjectId = this.itemSubject.value();
        if (!subjects.contains(_subjectId)) {
            subjects.push(_subjectId);
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

class AdminSubjectPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/subject').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (!course) {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    addSubject = e => e.preventDefault() || this.modal.show();

    swap = (e, item, isMoveUp) => {
        e.preventDefault();
        const { _id, subjects = [] } = this.props.course.item;
        const index = subjects.findIndex(_item => _item._id == item._id);
        if (isMoveUp) {
            if (index > 0) {
                const preItem = subjects[index - 1];
                subjects[index - 1] = item;
                subjects[index] = preItem;
            } else return;
        } else {
            if (index < subjects.length - 1) {
                const postItem = subjects[index + 1];
                subjects[index + 1] = item;
                subjects[index] = postItem;
            } else return;
        }
        this.props.updateCourse(_id, { subjects });
    }

    removeSubject = (e, index) => e.preventDefault() || T.confirm('Xoá môn học', 'Bạn có chắc muốn xoá môn học khỏi khóa học này?', true, isConfirm => {
        if (isConfirm && this.props.course && this.props.course.item) {
            const { _id, subjects = [] } = this.props.course.item;
            subjects.splice(index, 1);
            this.props.updateCourse(_id, { subjects: subjects.length ? subjects : 'empty' });
        }
    });

    render() {
        const currentUser = this.props.system ? this.props.system.user : null,
            permission = this.getUserPermission('course');
        const readOnly = (!permission.write || currentUser.isLecturer) && !currentUser.isCourseAdmin,
            item = this.props.course && this.props.course.item ? this.props.course.item : { subjects: [] };
        const table = renderTable({
            getDataSource: () => item && item.subjects,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '100%' }}>Tên môn học</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số bài học</th>
                    {!readOnly && <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>}
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/dao-tao/mon-hoc/' + item._id} />
                    <TableCell type='number' content={item.lessons ? item.lessons.length : 0} />
                    {!readOnly && (
                        <TableCell type='buttons' content={item} permission={{ write: true, delete: true }} onDelete={e => this.removeSubject(e, index)} onSwap={this.swap} />
                    )}
                </tr>),
        });

        const backRoute = `/user/course/${item._id}`;
        return this.renderPage({
            icon: 'fa fa-briefcase',
            title: 'Môn học: ' + item.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={backRoute}>{item.name}</Link> : '', 'Môn học'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>
                        {table}
                        <SubjectModal ref={e => this.modal = e} update={this.props.updateCourse} _id={item._id} subjects={item.subjects || []} />
                        {!readOnly ?
                            <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.addSubject}>
                                <i className='fa fa-lg fa-plus' />
                            </button> : null}
                    </div>
                </div>),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, updateCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminSubjectPage);
