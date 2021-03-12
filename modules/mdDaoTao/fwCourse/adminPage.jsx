import React from 'react';
import { connect } from 'react-redux';
import { getCourseInPage, createCourse, updateCourse, deleteCourse } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { Select } from 'view/component/Input';
import { ajaxSelectCourseType } from '../fwCourseType/redux';

class CourseModal extends React.Component {
    modal = React.createRef();
    licenseClass = React.createRef();

    componentDidMount() {
        T.ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#title').focus());
        });
    }

    show = () => {
        $('#title').val('');
        $(this.modal.current).modal('show');
    }

    save = (event) => {
        const newData = {
            title: $('#title').val(),
            licenseClass: this.licenseClass.current.val(),
        };

        if (newData.title == '') {
            T.notify('Tên khóa học bị trống!', 'danger');
            $('#title').focus();
        } if (newData.licenseClass == '') {
            T.notify('Loại khóa học bị trống!', 'danger');
            this.licenseClass.current.focus();
        } else {
            this.props.createCourse(newData, data => {
                if (data.item) {
                    $(this.modal.current).modal('hide');
                    this.props.history.push('/user/course/edit/' + data.item._id);
                }
            });
        }
        event.preventDefault();
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Khóa học mới</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='title'>Tên khóa học</label>
                                <input className='form-control' id='title' type='text' placeholder='Nhập tên khóa học' />
                            </div>
                            <div className='form-group'>
                                <Select ref={this.licenseClass} displayLabel={true} adapter={ajaxSelectCourseType} label='Loại khóa học' />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-primary'>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class CoursePage extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
    }

    componentDidMount() {
        this.props.getCourseInPage();
        T.ready('/user/course/list');
    }
    create = (e) => {
        this.modal.current.show();
        e.preventDefault();
    }


    changeActive = (item) => {
        this.props.updateCourse(item._id, { active: !item.active });
    }

    delete = (e, item) => {
        T.confirm('Khóa học', 'Bạn có chắc bạn muốn xóa khóa học này?', 'warning', true, isConfirm => isConfirm && this.props.deleteCourse(item._id));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.contains('course:write');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.course && this.props.course.page ?
            this.props.course.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        let table = 'Không có khóa học!';
        if (this.props.course && this.props.course.page && this.props.course.page.list && this.props.course.page.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tiêu đề</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.course.page.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td><Link to={'/user/course/edit/' + item._id}>{item.title}</Link></td>
                                <td className='toggle' style={{ textAlign: 'center' }} >
                                    <label>
                                        <input type='checkbox' checked={item.active} onChange={() => !readOnly && this.changeActive(item, index)} disabled={readOnly} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        <Link to={'/user/course/edit/' + item._id} className='btn btn-primary'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>
                                        {readOnly ? null :
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file' /> Khóa học</h1>
                </div>
                <div className='tile'>{table}</div>
                <CourseModal createCourse={this.props.createCourse} ref={this.modal} history={this.props.history} />
                <Pagination name='pageCourse'
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getCourseInPage} />
                {readOnly ? null :
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                        onClick={this.create}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getCourseInPage, createCourse, updateCourse, deleteCourse };
export default connect(mapStateToProps, mapActionsToProps)(CoursePage);