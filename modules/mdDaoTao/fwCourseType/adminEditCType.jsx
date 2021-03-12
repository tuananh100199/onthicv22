import React from 'react';
import { connect } from 'react-redux';
import { updateCourseType, getCourseType } from './redux';
import { Link } from 'react-router-dom';
import Editor from 'view/component/CkEditor4';
import { ajaxSelectSubject } from '../fwMonHoc/redux';
import { Select } from 'view/component/Input';

class SubjectModal extends React.Component {
    state = { item: null };
    modal = React.createRef();
    subjectSelect = React.createRef();

    show = () =>
        $(this.modal.current).modal('show');

    save = (event) => {
        const changeItem = this.subjectSelect.current.val();
        const subjectList = this.props.item.subjectList;
        subjectList.push(changeItem);

        if (this.props.item && this.props.item._id) {
            this.props.updateCourseType(this.props.item._id, { subjectList: subjectList }, () => {
                T.notify('Thêm môn học thành công', 'success');
                $(this.modal.current).modal('hide');
            });
        }
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
                                <Select ref={this.subjectSelect} displayLabel={true} adapter={ajaxSelectSubject} label='Môn học' />
                            </div>
                        </div>

                        <div className='modal-footer'>
                            <button type='button' className='btn btn-success' onClick={this.save}>Lưu</button>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
class adminEditCType extends React.Component {
    state = { item: null };
    editor = React.createRef();
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/course-type/list', () => {
            const route = T.routeMatcher('/user/course-type/edit/:courseTypeId'),
                courseTypeId = route.parse(window.location.pathname).courseTypeId;
            this.props.getCourseType(courseTypeId, data => {
                if (data.error) {
                    T.notify('Lấy loại khóa học bị lỗi!', 'danger');
                    this.props.history.push('/user/course-type/list');
                } else if (data.item) {
                    const item = data.item;
                    $('#title').val(item.title);
                    $('#price').val(item.price);
                    $('#shortDescription').val(item.shortDescription);
                    this.editor.current.html(item.detailDescription);
                    this.setState(data);
                    $('#title').focus();
                } else {
                    this.props.history.push('/user/course-type/list');
                }
            });
        });
    }
    remove = (e, index) => {
        e.preventDefault();
        T.confirm('Xoá môn học ', 'Bạn có chắc muốn xoá môn học khỏi loại khóa học này?', true, isConfirm => {
            if (isConfirm) {
                let subjectList = this.state.item.subjectList || [];
                const changes = {};
                subjectList.splice(index, 1);
                if (subjectList.length == 0) subjectList = 'empty';
                changes.subjectList = subjectList;
                this.props.updateCourseType(this.state.item._id, changes, () => {
                    T.alert('Xoá môn học khỏi loại khóa học thành công!', 'error', false, 800);
                });
            }
        })
    };
    showSelectModal = (e) => {
        e.preventDefault();
        this.modal.current.show();
    }
    save = () => {
        const changes = {
            title: $('#title').val().trim(),
            price: $('#price').val().trim(),
            shortDescription: $('#shortDescription').val().trim(),
            detailDescription: this.editor.current.html(),
        };
        this.props.updateCourseType(this.state.item._id, changes)
    };
    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermissions.includes('course:write');
        const item = this.props.courseType && this.props.courseType.courseType ? this.props.courseType.courseType : { title: '', subjectList: [] };
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
                                <td>
                                    {item.title ? item.title : 'null'}
                                </td>
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
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file' /> Loại khóa học: {item.title || ''}</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
                        <Link to='/user/course/list'>Loại khóa học</Link>&nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>Thông tin chung</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <div className='form-group col-md-6'>
                                <label className='control-label'>Tên loại khóa học</label>
                                <input className='form-control' type='text' placeholder='Tên loại khóa học' id='title' readOnly={readOnly} />
                            </div>
                            <div className='form-group col-md-6'>
                                <label className='control-label'>Giá loại khóa học</label>
                                <input className='form-control' type='number' placeholder='Giá loại khóa học' id='price' readOnly={readOnly} />
                            </div>
                        </div>

                        <div className='form-group'>
                            <label className='control-label'>Mô tả ngắn gọn</label>
                            <textarea defaultValue='' className='form-control' id='shortDescription' placeholder='Mô tả ngắn gọn' readOnly={readOnly} rows={5} />
                        </div>
                        <div className='form-group'>
                            <label className='control-label'>Mô tả chi tiết </label>
                            <Editor ref={this.editor} height='400px' placeholder='Mô tả chi tiết' uploadUrl='/user/upload?category=courseType' readOnly={readOnly} />
                        </div>
                    </div>

                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                        <button className='btn btn-primary' type='button' onClick={this.save}>
                            <i className='fa fa-fw fa-lg fa-save' /> Lưu
                        </button>
                    </div>
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>Môn học</h3>
                    <div className='tile-body'>
                        {table}
                    </div>
                    {readOnly ? null :
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={this.showSelectModal}>
                                <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                                </button>
                        </div>}
                </div>
                <SubjectModal ref={this.modal} updateCourseType={this.props.updateCourseType} history={this.props.history} item={item} />
                <Link to='/user/course-type/list' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}><i className='fa fa-lg fa-reply' /></Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, courseType: state.courseType });
const mapActionsToProps = { updateCourseType, getCourseType };
export default connect(mapStateToProps, mapActionsToProps)(adminEditCType);
