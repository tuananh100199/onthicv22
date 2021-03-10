import React from 'react';
import { connect } from 'react-redux';
import { getBaiHocInPage, createBaiHoc, updateBaiHoc, deleteBaiHoc } from './redux/redux.jsx'
import { Link } from 'react-router-dom';
import Pagination from '../../view/component/Pagination.jsx';

class MonHocPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { searchText: '', isSearching: false };
    }
    componentDidMount() {
        this.props.getBaiHocInPage(1, 50, {});
        T.ready('/user/dao-tao', null);
    }

    create = (e) => {
        this.props.createBaiHoc(data => this.props.history.push('/user/dao-tao/bai-hoc/edit/' + data.item._id));
        e.preventDefault();
    }
    delete = (e, item) => {
        T.confirm('Môn học', 'Bạn có chắc bạn muốn xóa môn học này?', 'warning', true, isConfirm => isConfirm && this.props.deleteBaiHoc(item._id));
        e.preventDefault();
    }

    search = (e) => {
        e.preventDefault();
        let condition = {},
            searchText = $('#searchTextBox').val();
        if (searchText) condition.searchText = searchText;

        this.setState({ isSearching: true }, () => {
            this.props.getBaiHocInPage(undefined, undefined, condition, () => {
                this.setState({ searchText, isSearching: false });
            });
        })
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.baihoc && this.props.baihoc.page ?
            this.props.baihoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        let table = 'Không có bài học mới!';
        if (this.props.baihoc && this.props.baihoc.page && this.props.baihoc.page.list && this.props.baihoc.page.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tiêu đề</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.baihoc.page.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td><Link to={'/user/dao-tao/bai-hoc/edit/' + item._id}>{item.title}</Link></td>
                                <td>
                                    <div className='btn-group'>
                                        <Link to={'/user/dao-tao/bai-hoc/edit/' + item._id} className='btn btn-primary'>
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
                    <h1><i className='fa fa-file' /> Bài học: Danh sách</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <form style={{ position: 'relative', border: '1px solid #ddd', marginRight: 6 }} onSubmit={e => this.search(e)}>
                            <input className='app-search__input' id='searchTextBox' type='search' placeholder='Tìm kiếm bài học' />
                            <a href='#' style={{ position: 'absolute', top: 6, right: 9 }} onClick={e => this.search(e)}><i className='fa fa-search' /></a>
                        </form>
                        {this.state.isSearching ?
                            <a href='#' onClick={e => $('#searchTextBox').val('') && this.search(e)} style={{ color: 'red', marginRight: 12, marginTop: 6 }}>
                                <i className='fa fa-trash' />
                            </a> : null}
                    </ul>
                </div>
                <div className='row tile'>{table}</div>
                <Pagination name='pageLesson'
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getBaiHocInPage} />
                {currentPermissions.contains('course:write') ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                        onClick={this.create}>
                        <i className='fa fa-lg fa-plus' />
                    </button> : ''}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, baihoc: state.baihoc });
const mapActionsToProps = { getBaiHocInPage, createBaiHoc, updateBaiHoc, deleteBaiHoc };
export default connect(mapStateToProps, mapActionsToProps)(MonHocPage);
