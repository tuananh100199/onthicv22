import React from 'react';
import { connect } from 'react-redux';
import { getCourseInPage, createCourse, updateCourse, swapCourse, deleteCourse } from './redux.jsx'
import { Link } from 'react-router-dom';
import Pagination from '../../view/component/Pagination.jsx';

class CoursePage extends React.Component {
    componentDidMount() {
        this.props.getCourseInPage();
        T.ready();
    }

    create = (e) => {
        this.props.createCourse(data => this.props.history.push('/user/course/edit/' + data.item._id));
        e.preventDefault();
    }

    swap = (e, item, isMoveUp) => {
        this.props.swapCourse(item._id, isMoveUp);
        e.preventDefault();
    }

    changeActive = (item) => {
        this.props.updateCourse(item._id, { active: !item.active });
    }

    changeisInternal = (item) => this.props.updateCourse(item._id, { isInternal: !item.isInternal })

    delete = (e, item) => {
        T.confirm('Khóa học', 'Bạn có chắc bạn muốn xóa khóa học này?', 'warning', true, isConfirm => isConfirm && this.props.deleteCourse(item._id));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('course:write');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.course && this.props.course.page ?
            this.props.course.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        let table = 'Không có khóa học!';
        if (this.props.course && this.props.course.page && this.props.course.page.list && this.props.course.page.list.length > 0) {
            const { list } = this.props.course.page ? this.props.course.page : { list: [] };

            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tiêu đề</th>
                            <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    <Link to={'/user/course/edit/' + item._id}>{T.language.parse(item.title)}</Link>
                                </td>
                                <td style={{ width: '20%', textAlign: 'center' }}>
                                    <img src={item.image} alt='avatar' style={{ height: '32px' }} />
                                </td>

                                <td className='toggle' style={{ textAlign: 'center' }} >
                                    <label>
                                        <input type='checkbox' checked={item.active} onChange={() => !readOnly && this.changeActive(item, index)} disabled={readOnly} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        {readOnly ? null : [
                                            <a key={0} className='btn btn-success' href='#' onClick={e => this.swap(e, item, true)}>
                                                <i className='fa fa-lg fa-arrow-up' />
                                            </a>,
                                            <a key={1} className='btn btn-success' href='#' onClick={e => this.swap(e, item, false)}>
                                                <i className='fa fa-lg fa-arrow-down' />
                                            </a>
                                        ]}
                                        <Link to={'/user/course/edit/' + item._id} data-id={item._id} className='btn btn-primary'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>

                                        {currentPermissions.contains('course:write') ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
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
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file' /> Khóa học: Danh sách</h1>
                </div>
                <div className='row tile'>{table}</div>
                <Pagination name='pageCourse'
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getCourseInPage} />
                {currentPermissions.contains('course:write') ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                        onClick={this.create}>
                        <i className='fa fa-lg fa-plus' />
                    </button> : ''}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getCourseInPage, createCourse, updateCourse, swapCourse, deleteCourse };
export default connect(mapStateToProps, mapActionsToProps)(CoursePage);