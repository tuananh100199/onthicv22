import React from 'react';
import { connect } from 'react-redux';
import { updateCourse, getCourse } from './redux';
import { Link } from 'react-router-dom';
import { Select } from 'view/component/Input';
import { ajaxSelectSubject } from '../fwSubject/redux';

class SubjectModal extends React.Component {
    state = { item: null };
    modal = React.createRef();
    subjectSelect = React.createRef();

    show = () => {
        this.subjectSelect.current.val('');
        $(this.modal.current).modal('show');
    }

    save = (event) => {
        event.preventDefault();
        const changeItem = this.subjectSelect.current.val();
        const subjectList = this.props.item.subjectList;
        subjectList.push(changeItem);
        this.props.updateCourse(this.props.item._id, { subjectList }, () => {
            T.notify('Thêm môn học thành công', 'success');
            $(this.modal.current).modal('hide');
        });
        event.preventDefault();
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <div className='modal-dialog' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Môn học</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>

                        <div className='modal-body'>
                            <div className='form-group'>
                                <Select ref={this.subjectSelect} displayLabel={true}
                                    adapter={{
                                        ...ajaxSelectSubject, processResults: response =>
                                            ({ results: response && response.page && response.page.list ? response.page.list.filter(item => !this.props.item.subjectList.map(item => item._id).includes(item._id)).map(item => ({ id: item._id, text: item.title })) : [] })
                                    }} label='Môn học' />
                            </div>
                        </div>

                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-success' onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class SubjectPage extends React.Component {
    state = { item: null };
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/course/list', () => {
            const route = T.routeMatcher('/user/course/edit/:courseId'),
                courseId = route.parse(window.location.pathname).courseId;
            this.props.getCourse(courseId, data => {
                if (data.error) {
                    T.notify('Lấy khóa học bị lỗi!', 'danger');
                    this.props.history.push('/user/course/list');
                } else if (data.item) {
                    this.setState(data);
                    $('#title').focus();
                } else {
                    this.props.history.push('/user/course/list');
                }
            });
        });
    }
    remove = (e, index) => {
        e.preventDefault();
        T.confirm('Xoá môn học ', 'Bạn có chắc muốn xoá môn học khỏi khóa học này?', true, isConfirm => {
            if (isConfirm) {
                let subjectList = this.props.course.course.subjectList || [];
                subjectList.splice(index, 1);
                if (subjectList.length == 0) subjectList = 'empty';
                this.props.updateCourse(this.state.item._id, { subjectList }, () => {
                    T.alert('Xoá môn học khỏi khóa học thành công!', 'error', false, 800);
                });
            }
        })
    };
    showSelectModal = (e) => {
        e.preventDefault();
        this.modal.current.show();
    }
    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermissions.includes('course:write');
        const item = this.props.course && this.props.course.course ? this.props.course.course : { subjectList: [] };
        let table = item.subjectList && item.subjectList.length ? (
            <table className='table table-hover table-bordered'>
                <thead>
                    <tr>
                        <th style={{ width: 'auto' }}>#</th>
                        <th style={{ width: '100%' }}>Tên môn học</th>
                        {readOnly ? null : <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>}
                    </tr>
                </thead>
                <tbody>
                    {item.subjectList.sort((a, b) =>
                        a.title.localeCompare(b.title)).map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td><Link to={'/user/dao-tao/mon-hoc/edit/' + item._id}>{item.title}</Link></td>
                                <td>
                                    {!readOnly &&
                                        <div className='btn-group'>
                                            <a className='btn btn-danger' href='#' onClick={e => this.remove(e, index)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a>
                                        </div>
                                    }
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        ) : <p>Không có danh sách các môn học!</p>
        return (
            <>
                <div className='tile-body'>
                    {table}
                </div>
                <SubjectModal ref={this.modal} updateCourse={this.props.updateCourse} history={this.props.history} item={item} />
                <Link to='/user/course/list' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}><i className='fa fa-lg fa-reply' /></Link>
                {!readOnly && (
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={e => this.showSelectModal(e)}>
                        <i className='fa fa-lg fa-plus' />
                    </button>
                )}
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { updateCourse, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(SubjectPage);
