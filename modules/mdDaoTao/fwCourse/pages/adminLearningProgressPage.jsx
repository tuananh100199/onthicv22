import React from 'react';
import { connect } from 'react-redux';
import { getLearingProgressByLecturer } from '../redux';
import { updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox } from 'view/component/AdminPage';

class Modal extends AdminModal {
    state = {};
    onShow = (item) => {
        const { _id, student, diemThucHanh } = item || { diemThucHanh: 0 };
        this.itemDiemThucHanh.value(diemThucHanh);

        this.setState({ loading: false, _id, student });
    }

    onSubmit = () => {
        const _id = this.state;
        const changes = {
            diemThucHanh: this.itemDiemThucHanh.value(),
        };
        if (changes.diemThucHanh == '') {
            T.notify('Vui lòng nhập điểm thực hành!', 'danger');
            this.itemDiemThucHanh.focus();
        } else {
            this.props.updateStudent(_id, changes, () => {
                this.props.getLearingProgressByLecturer(this.props.courseId, data => {
                    this.setState({ listStudent: data.item });
                });
                this.hide();
            });
        }
    }

    onChangeScore = () => {
        let diemThucHanh = this.itemDiemThucHanh.value();
        if (diemThucHanh) {
            diemThucHanh = Number(diemThucHanh);
            if (diemThucHanh < 0) {
                this.itemDiemThucHanh.value(0);
            } else if (diemThucHanh > 10) {
                this.itemDiemThucHanh.value(diemThucHanh % 100 <= 10 ? diemThucHanh % 100 : diemThucHanh % 10);
            }
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Điểm thực hành',
            body: <>
                <FormTextBox ref={e => this.itemDiemThucHanh = e} label='Nhập điểm' type='number' min='0' max='10' onChange={this.onChangeScore} readOnly={this.props.readOnly} />
            </>,
        });
    }
}

class AdminLearningProgressPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/learning').parse(window.location.pathname);
            if (params && params._id) {
                this.props.getLearingProgressByLecturer(params._id, data => {
                    // TODO: Tuấn Anh null nè
                    console.log(params._id, data.item);
                    this.setState({ listStudent: data.item });
                });
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.item !== this.props.item) {
            this.props.getLearingProgressByLecturer(this.props.courseId, data => {
                this.setState({ listStudent: data.item });
            });
        }
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    render() {
        const data = this.state.listStudent ? this.state.listStudent : [],
            courseItem = this.props.course && this.props.course.item ? this.props.course.item : { subjects: [] },
            subjects = courseItem && courseItem.subjects && courseItem.subjects.sort((a, b) => a.monThucHanh - b.monThucHanh);
        const table = renderTable({
            getDataSource: () => data, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên học viên</th>
                    <th style={{ width: '100%' }}>CMND/CCCD</th>
                    {subjects.length && subjects.map((subject, i) => (<th key={i} style={{ width: 'auto', color: subject.monThucHanh ? 'aqua' : 'coral' }} nowrap='true'>{subject.title}</th>))}
                    <th style={{ width: 'auto' }}>Điểm lý thuyết</th>
                    <th style={{ width: 'auto' }}>Điểm thực hành</th>
                    <th style={{ width: 'auto' }}>Điểm trung bình</th>
                    <th style={{ width: 'auto' }}>Nhập điểm thực hành</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.lastname + ' ' + item.firstname} />
                    <TableCell type='text' content={item.identityCard} />
                    {subjects.length && subjects.map((subject, i) => (
                        <TableCell key={i} type='text' style={{ textAlign: 'center' }} content={` 
                            ${item.subject && item.subject[subject._id] && !subject.monThucHanh ? item.subject[subject._id].completedLessons : 0}
                            / ${subject.monThucHanh ? 0 : subject.lessons.length}
                            ${subject.monThucHanh ? '' : `=> ${item.subject && item.subject[subject._id] ? item.subject[subject._id].diemLyThuyet : 0}`}
                         ` }
                        />))}
                    <TableCell type='text' content={item.diemLyThuyet} />
                    <TableCell type='text' content={this.props.course && this.props.course.item[index] && this.props.course.item[index].diemThucHanh ? this.props.course.item[index].diemThucHanh : 0} />
                    <TableCell type='text' content={this.props.course && this.props.course.item[index] && this.props.course.item[index] ? (Number(Number((this.props.course.item[index].diemThucHanh ? this.props.course.item[index].diemThucHanh : 0)) + item.diemLyThuyet) / 2).toFixed(1) : 0} />
                    <TableCell type='buttons' content={item} onEdit={this.edit} />

                </tr>),
        });
        return <div className='tile-body'>
            {table}
            <Modal ref={e => this.modal = e} updateStudent={this.props.updateStudent} getLearingProgressByLecturer={this.props.getLearingProgressByLecturer} courseId={this.props.courseId} />
        </div>;
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getLearingProgressByLecturer, updateStudent };
export default connect(mapStateToProps, mapActionsToProps)(AdminLearningProgressPage);