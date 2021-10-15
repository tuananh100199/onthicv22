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
            const params = T.routeMatcher('/user/course/:_id/info').parse(window.location.pathname);
            const course = this.props.course ? this.props.course.item : null;
            if (!course) {
                if (params && params._id) {
                    const previousRoute = '/user/course/' + params._id;
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push(previousRoute);
                        } else if (data.item) {
                            const { name, maxStudent, detailDescription, courseType, courseFee,
                                thoiGianKhaiGiang, thoiGianBatDau, thoiGianKetThuc, thoiGianThiKetThucMonDuKien, thoiGianThiKetThucMonChinhThuc, thoiGianThiTotNghiepDuKien, thoiGianThiTotNghiepChinhThuc, active, chatActive } = data.item;

                            this.name.value(name);
                            this.courseType.value(courseType ? { id: courseType._id, text: courseType.title } : null);
                            this.courseFee.value(courseFee);
                            this.maxStudent.value(maxStudent);
                            this.detailDescription.html(detailDescription);

                            this.thoiGianKhaiGiang.value(thoiGianKhaiGiang);
                            this.thoiGianBatDau.value(thoiGianBatDau);
                            this.thoiGianKetThuc.value(thoiGianKetThuc);
                            this.thoiGianThiKetThucMonDuKien.value(thoiGianThiKetThucMonDuKien);
                            this.thoiGianThiKetThucMonChinhThuc.value(thoiGianThiKetThucMonChinhThuc);
                            this.thoiGianThiTotNghiepDuKien.value(thoiGianThiTotNghiepDuKien);
                            this.thoiGianThiTotNghiepChinhThuc.value(thoiGianThiTotNghiepChinhThuc);
                            this.active.value(active);
                            this.chatActive.value(chatActive);
                            this.setState(data.item);
                        } else {
                            this.props.history.push(previousRoute);
                        }
                    });
                } else {
                    this.props.history.push('/user/course/');
                }
            }
        });
    }

    addSubject = e => e.preventDefault() || this.modal.show();

    removeSubject = (e, index) => e.preventDefault() || T.confirm('Xoá môn học', 'Bạn có chắc muốn xoá môn học khỏi khóa học này?', true, isConfirm => {
        if (isConfirm && this.props.course && this.props.course.item) {
            const { _id, subjects = [] } = this.props.course.item;
            subjects.splice(index, 1);
            this.props.updateCourse(_id, { subjects: subjects.length ? subjects : 'empty' });
        }
    });

    render() {
        const course = this.props.course ? this.props.course.item || {} : {};
        const readOnly = this.props.readOnly,
            item = this.props.course && this.props.course.item ? this.props.course.item : { subjects: [] };
        const table = renderTable({
            getDataSource: () => item && item.subjects && item.subjects.sort((a, b) => a.title.localeCompare(b.title)),
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
                    {!readOnly ?
                        <td>
                            <div className='btn-group'>
                                <a className='btn btn-danger' href='#' onClick={e => this.removeSubject(e, index)}><i className='fa fa-lg fa-trash' /></a>
                            </div>
                        </td> : null}
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Môn học: ' + course.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, 'Môn học'],
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
            onBack: () => this.props.history.goBack(),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, updateCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminSubjectPage);
