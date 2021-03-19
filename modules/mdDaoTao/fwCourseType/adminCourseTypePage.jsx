import React from 'react';
import { connect } from 'react-redux';
import { getCourseTypeInPage, createCourseType, updateCourseType, deleteCourseType } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class CourseTypePage extends AdminPage {

    componentDidMount() {
        this.props.getCourseTypeInPage();
    }

    create = (e) => {
        this.props.createCourseType(data => this.props.history.push('/user/course-type/edit/' + data.item._id));
        e.preventDefault();
    }
    delete = (e, item) => {
        T.confirm('Loại khóa học', 'Bạn có chắc bạn muốn xóa loại khóa học này?', true, isConfirm => isConfirm && this.props.deleteCourseType(item._id));
        e.preventDefault();
    }
    render() {
        const permission = this.getUserPermission('course-type');
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
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hiển thị giá</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giá</th>
                            <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                            {permission.write || permission.delete ? <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td><Link to={'/user/course-type/edit/' + item._id}>{item.title}</Link></td>
                                <td className='toggle' style={{ textAlign: 'center' }} >
                                    <label>
                                        <input type='checkbox' checked={item.isPriceDisplayed}
                                            onChange={() => permission.write && this.props.updateCourseType(item._id, { isPriceDisplayed: !item.isPriceDisplayed }, () => T.notify('Cập nhật loại khóa học thành công!', 'success'))} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td className='toggle' style={{ textAlign: 'right' }} nowrap='true'>{T.numberDisplay(item.price ? item.price + ' VND' : '')}</td>
                                <td style={{ width: '20%', textAlign: 'center' }}>
                                    <img src={item.image} alt='avatarCourseType' style={{ height: '32px' }} />
                                </td>
                                {permission.write || permission.delete ? <td>
                                    <div className='btn-group'>
                                        {permission.write ?
                                            <Link to={'/user/course-type/edit/' + item._id} data-id={item._id} className='btn btn-primary'>
                                                <i className='fa fa-lg fa-edit' />
                                            </Link> : null}
                                        {permission.delete ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a> : null}
                                    </div>
                                </td> : null}
                            </tr>))}
                    </tbody>
                </table>);
        }

        const renderData = {
            icon: 'fa fa-file',
            title: 'Loại khóa học',
            breadcrumb: ['Loại khóa học'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageCourseType' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getCourseTypeInPage} />
            </>,
        };
        if (permission.write) renderData.onCreate = this.create;
        return this.renderPage(renderData);
    }
}

const mapStateToProps = state => ({ system: state.system, courseType: state.courseType });
const mapActionsToProps = { getCourseTypeInPage, createCourseType, updateCourseType, deleteCourseType };
export default connect(mapStateToProps, mapActionsToProps)(CourseTypePage);
