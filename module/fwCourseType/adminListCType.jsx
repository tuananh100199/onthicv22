import React from 'react';
import { connect } from 'react-redux';
import { getCourseTypeInPage, createCourseType, updateCourseType, deleteCourseType } from './redux.jsx'
import { Link } from 'react-router-dom';
import Pagination from '../../view/component/Pagination.jsx';

class CourseTypePage extends React.Component {
    componentDidMount() {
        this.props.getCourseTypeInPage();
    }

    create = (e) => {
        this.props.createCourseType(data => this.props.history.push('/user/course-type/edit/' + data.item._id));
        e.preventDefault();
    }
    delete = (e, item) => {
        T.confirm('Khóa học', 'Bạn có chắc bạn muốn xóa loại khóa học này?', 'warning', true, isConfirm => isConfirm && this.props.deleteCourseType(item._id));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.courseType && this.props.courseType.page ?
            this.props.courseType.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        let table = 'Không có loại khóa học!';
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tiêu đề</th>
                            <th style={{ width: '20%', textAlign: 'center' }}>Giá</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td><Link to={'/user/course-type/edit/' + item._id}>{item.title}</Link></td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    {T.numberDisplay(item.price ? item.price + ' VND' : '')}
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        <Link to={'/user/course-type/edit/' + item._id} className='btn btn-primary'>
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
                    <h1><i className='fa fa-file' /> Loại khóa học</h1>
                </div>
                <div className='tile'>{table}</div>
                <Pagination name='pageCourseType'
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getCourseTypeInPage} />
                {currentPermissions.contains('course:write') ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.create}>
                        <i className='fa fa-lg fa-plus' />
                    </button> : ''}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, courseType: state.courseType });
const mapActionsToProps = { getCourseTypeInPage, createCourseType, updateCourseType, deleteCourseType };
export default connect(mapStateToProps, mapActionsToProps)(CourseTypePage);
