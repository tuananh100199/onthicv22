import React from 'react';
import { connect } from 'react-redux';
import { getSubjectLessonList, addSubjectLesson, swapSubjectLesson, deleteSubjectLesson } from './redux';
import { Link } from 'react-router-dom';
import { Select } from 'view/component/Input';
import { ajaxSelectLesson } from '../fwLesson/redux';
import Tooltip from 'rc-tooltip';
import { AdminModal } from 'view/component/AdminPage';

class AddLessonModal extends AdminModal {
    lessonSelect = React.createRef();
    componentDidMount() {
        $(document).ready(() => this.onShown(() => $('#questionName').focus()));
    }

    onShow = () => {
        this.lessonSelect.current.val(null);
    }

    onSubmit = () => {
        const lessonId = this.lessonSelect.current.val();
        this.props.addSubjectLesson(this.props._id, lessonId, () => {
            T.notify('Thêm bài học thành công!', 'success');
            this.hide();
        });

    }

    render = () => this.renderModal({
        title: 'Thêm bài học',
        body:
            <div>
                <div className='form-group'>
                    <label>Chọn bài học</label>
                    <Select ref={this.lessonSelect} displayLabel={false} adapter={ajaxSelectLesson} label='Bài học' />
                </div>
            </div>
    });
}

class AdminEditLesson extends React.Component {
    state = {};
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/dao-tao/mon-hoc', () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/mon-hoc/edit/:_id').parse(url);
            this.props.getSubjectLessonList(params._id);
            this.setState({ subjectId: params._id })
        });
    }

    showAddLessonModal = e => {
        e.preventDefault();
        this.modal.current.show();
    }

    delete = (e, _id, lessonId, lessonTitle) => {
        e.preventDefault();
        T.confirm('Xóa Bài học', `Bạn có chắc bạn muốn xóa bài học <strong>${lessonTitle}</strong>?`, true, isConfirm => isConfirm && this.props.deleteSubjectLesson(_id, lessonId, () => {
            T.alert('Xoá câu hỏi thành công!', 'success', false, 1000);
        })
        )
    }

    swap = (e, index, _id, isMoveUp) => {
        e.preventDefault();
        let lessonList = this.props.subject && this.props.subject.listLesson && this.props.subject.listLesson.lesson ? this.props.subject.listLesson.lesson : [];
        if (lessonList.length == 1) {
            T.notify('Thay đổi thứ tự bài học thành công', 'success');
        } else {
            if (isMoveUp) {
                if (index == 0) {
                    T.notify('Thay đổi thứ tự bài học thành công', 'success');
                } else {
                    const temp = lessonList[index - 1], changes = {};

                    lessonList[index - 1] = lessonList[index];
                    lessonList[index] = temp;

                    changes.lesson = lessonList;
                    this.props.swapSubjectLesson(_id, changes, () => {
                        T.notify('Thay đổi thứ tự bài học thành công', 'success');
                    });
                }
            } else {
                if (index == lessonList.length - 1) {
                    T.notify('Thay đổi thứ tự bài học thành công', 'success');
                } else {
                    const temp = lessonList[index + 1], changes = {};

                    lessonList[index + 1] = lessonList[index];
                    lessonList[index] = temp;

                    changes.lesson = lessonList;
                    this.props.swapSubjectLesson(_id, changes, () => {
                        T.notify('Thay đổi thứ tự bài học thành công', 'success');
                    });
                }
            }
        }
    };

    render() {
        const lesson = this.props.subject && this.props.subject.listLesson && this.props.subject.listLesson.lesson ?
            this.props.subject.listLesson.lesson : []
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('lesson:write');
        let table = 'Chưa có bài học!';
        if (lesson && lesson.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tên bài học</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lesson.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><Link to={'/user/dao-tao/bai-hoc/edit/' + item._id}>{item.title}</Link></td>
                                <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, this.state.subjectId, true)}>
                                            <i className='fa fa-lg fa-arrow-up' />
                                        </a>
                                        <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, this.state.subjectId, false)}>
                                            <i className='fa fa-lg fa-arrow-down' />
                                        </a>

                                        <Link to={'/user/dao-tao/bai-hoc/edit/' + item._id} className='btn btn-primary'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>
                                        {currentPermissions.contains('lesson:write') ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, this.state.subjectId, item._id, item.title)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a> : null}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        return <>
            <div className='tile-body'>{table}
                {readOnly ? null :
                    <div style={{ textAlign: 'right' }}>
                        <Tooltip placement='bottom' overlay='Thêm bài học mới'>
                            <button type='button' className='btn btn-success' onClick={this.showAddLessonModal}>
                                <i className='fa fa-lg fa-plus' /> Thêm
                                </button>
                        </Tooltip>
                    </div>
                }
            </div>
            <AddLessonModal ref={this.modal} addSubjectLesson={this.props.addSubjectLesson} _id={this.state.subjectId} />
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.subject });
const mapActionsToProps = { getSubjectLessonList, addSubjectLesson, swapSubjectLesson, deleteSubjectLesson };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditLesson);
