import React from 'react';
import { connect } from 'react-redux';
import { getCourse, updateCourse } from '../redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormTextBox, FormCheckbox, TableCell, renderTable, CirclePageButton } from 'view/component/AdminPage';

class MonThiTotNghiepModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        let { title, score, totalScore, diemLiet, _id } = item || { title: '', score: '', totalScore: '', diemLiet: false };
        this.itemTitle.value(title);
        this.itemScore.value(score);
        this.itemTotalScore.value(totalScore);
        this.itemDiemLiet.value(diemLiet);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value(),
            score: this.itemScore.value(),
            totalScore: this.itemTotalScore.value(),
            diemLiet: this.itemDiemLiet.value()
        };
        let monThiTotNghiep = this.props.item;
        if (!this.state._id) {
            monThiTotNghiep.push(data);
        } else {
            let index = monThiTotNghiep.findIndex(monThi => monThi._id == this.state._id);
            data._id = this.state._id;
            if (index != -1) {
                monThiTotNghiep && monThiTotNghiep[index] ? monThiTotNghiep[index] = data : null;
            }
        }
        if (data.title == '') {
            T.notify('Tên môn thi bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (data.totalScore == '') {
            T.notify('Tổng số câu bị trống!', 'danger');
            this.itemTotalScore.focus();
        } else if (data.score == '') {
            T.notify('Số câu đậu bị trống!', 'danger');
            this.itemScore.focus();
        } else {
            this.props.updateCourse(this.props._id, { monThiTotNghiep }, this.hide);
        }
    }

    render = () => this.renderModal({
        title: 'Môn thi tốt nghiệp',
        body: (
            <div>
                <FormTextBox ref={e => this.itemTitle = e} label='Tên môn thi tốt nghiệp' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemTotalScore = e} label='Tổng số câu' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemScore = e} label='Số câu đậu' readOnly={this.props.readOnly} />
                <FormCheckbox ref={e => this.itemDiemLiet = e} isSwitch={true} label='Câu điểm liệt' readOnly={this.props.readOnly} />
            </div>),
    });
}

class AdmingGraduationSubjectPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/graduation-subject').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (!course) {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.setState({ courseId: params._id });
                        }
                    });
                } else {
                    this.setState({ courseId: params._id });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    swap = (e, item, isMoveUp) => {
        e.preventDefault();
        const { _id, monThiTotNghiep = [] } = this.props.course.item;
        const index = monThiTotNghiep.findIndex(_item => _item._id == item._id);
        if (isMoveUp) {
            if (index > 0) {
                const preItem = monThiTotNghiep[index - 1];
                monThiTotNghiep[index - 1] = item;
                monThiTotNghiep[index] = preItem;
            } else return;
        } else {
            if (index < monThiTotNghiep.length - 1) {
                const postItem = monThiTotNghiep[index + 1];
                monThiTotNghiep[index + 1] = item;
                monThiTotNghiep[index] = postItem;
            } else return;
        }
        this.props.updateCourse(_id, { monThiTotNghiep });
    }

    removeSubject = (e, index) => e.preventDefault() || T.confirm('Xoá môn học', 'Bạn có chắc muốn xoá môn thi tốt nghiệp khỏi khóa học này?', true, isConfirm => {
        if (isConfirm && this.props.course && this.props.course.item) {
            const { _id, monThiTotNghiep = [] } = this.props.course.item;
            monThiTotNghiep.splice(index, 1);
            this.props.updateCourse(_id, { monThiTotNghiep: monThiTotNghiep.length ? monThiTotNghiep : 'empty' });
        }
    });

    changeDiemLiet = (item, diemLiet, monThiTotNghiep) => {
        let index = monThiTotNghiep.findIndex(monThi => monThi._id == item._id);
        if (index != -1) {
            monThiTotNghiep && monThiTotNghiep[index] ? monThiTotNghiep[index].diemLiet = diemLiet : null;
        }
        this.props.updateCourse(this.state.courseId, { monThiTotNghiep });
    };

    render() {
        const currentUser = this.props.system ? this.props.system.user : null,
            permission = this.getUserPermission('course');
        const readOnly = (!permission.write || currentUser.isLecturer) && !currentUser.isCourseAdmin,
            item = this.props.course && this.props.course.item ? this.props.course.item : { subjects: [] };
        const monThiTotNghiep = item.monThiTotNghiep;
        const table = renderTable({
            getDataSource: () => item && item.monThiTotNghiep,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '100%' }}>Tên môn thi</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Tổng số câu</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số câu đậu</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Câu điểm liệt</th>
                    {/* <th style={{ width: 'auto' }} nowrap='true'>Số bài học</th> */}
                    {!readOnly && <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>}
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.title} />
                    <TableCell type='text' content={item.totalScore} />
                    <TableCell type='text' content={item.score} />
                    <TableCell type='checkbox' content={item.diemLiet} permission={permission} onChanged={diemLiet => this.changeDiemLiet(item, diemLiet, monThiTotNghiep)} />
                    {/* onChanged={diemLiet => this.changeDiemLiet(item, diemLiet)} */}
                    {/* <TableCell type='number' content={item.lessons ? item.lessons.length : 0} /> */}
                    {!readOnly && (
                        <TableCell type='buttons' content={item} permission={{ write: true, delete: true }} onDelete={e => this.removeSubject(e, index)} onSwap={this.swap} onEdit={(e, item,) => e.preventDefault() || this.monThiTotNghiepModal.show(item)} />
                    )}
                </tr>),
        });

        const backRoute = `/user/course/${item._id}`;
        return this.renderPage({
            icon: 'fa fa-clone',
            title: 'Môn thi tốt nghiệp: ' + item.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={backRoute}>{item.name}</Link> : '', 'Môn thi tốt nghiệp'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>
                        {table}
                        <MonThiTotNghiepModal ref={e => this.monThiTotNghiepModal = e} updateCourse={this.props.updateCourse} _id={item._id} item={item.monThiTotNghiep || []} />
                        {!readOnly ?
                            <CirclePageButton type='create' onClick={() => this.monThiTotNghiepModal.show()} /> : null}
                    </div>
                </div>),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, updateCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdmingGraduationSubjectPage);
