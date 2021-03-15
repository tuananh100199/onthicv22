import React from 'react';
import { connect } from 'react-redux';
import { getLessonInPage, createLesson, updateLesson, deleteLesson } from './redux/reduxLesson';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage } from 'view/component/AdminPage';

class ListLessonPage extends AdminPage {
    constructor(props) {
        super(props);
        this.state = { searchText: '', isSearching: false };
    }
    componentDidMount() {
        this.props.getLessonInPage(1, 50, {});
        T.ready('/user/dao-tao/bai-hoc/list', null);
    }

    create = (e) => {
        this.props.createLesson(data => this.props.history.push('/user/dao-tao/bai-hoc/edit/' + data.item._id));
        e.preventDefault();
    }
    delete = (e, item) => {
        T.confirm('Môn học', 'Bạn có chắc bạn muốn xóa môn học này?', 'warning', true, isConfirm => isConfirm && this.props.deleteLesson(item._id));
        e.preventDefault();
    }

    search = (e) => {
        e.preventDefault();
        let condition = {},
            searchText = $('#searchTextBox').val();
        if (searchText) condition.searchText = searchText;

        this.setState({ isSearching: true }, () => {
            this.props.getLessonInPage(undefined, undefined, condition, () => {
                this.setState({ searchText, isSearching: false });
            });
        })
    }

    render() {
        const permission = this.getUserPermission('lesson');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.lesson && this.props.lesson.page ?
            this.props.lesson.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        let table = 'Không có bài học mới!';
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tiêu đề</th>
                            {permission.write || permission.delete ? <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td><Link to={'/user/dao-tao/bai-hoc/edit/' + item._id}>{item.title}</Link></td>
                                {permission.write || permission.delete ? <td>
                                    <div className='btn-group'>
                                        {permission.write ?
                                            <Link to={'/user/dao-tao/bai-hoc/edit/' + item._id} className='btn btn-primary'>
                                                <i className='fa fa-lg fa-edit' />
                                            </Link> : null}
                                        {permission.delete || permission.write ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a> : null}
                                    </div>
                                </td> : null}
                            </tr>))}
                    </tbody>
                </table>
            );
        }

        const renderData = {
            icon: 'fa fa-book',
            title: 'Bài học',
            breadcrumb: [],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageLesson'
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getLessonInPage} />
                {permission.write ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                        onClick={this.create}>
                        <i className='fa fa-lg fa-plus' />
                    </button>
                    : null
                }
            </>,
        };
        return this.renderListPage(renderData);
    }
}

const mapStateToProps = state => ({ system: state.system, lesson: state.lesson });
const mapActionsToProps = { getLessonInPage, createLesson, updateLesson, deleteLesson };
export default connect(mapStateToProps, mapActionsToProps)(ListLessonPage);
