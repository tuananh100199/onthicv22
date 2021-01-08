import React, { Children } from 'react';
import { connect } from 'react-redux';
import { getFormInPage, createForm, updateForm, deleteForm, exportDonDeNghiHocToWord, exportBienNhanLanDauToWord, exportBanCamKetToWord } from './redux.jsx';
import { getUserInPage } from '../fwUser/redux.jsx';
import { getUser } from '../fwUser/redux.jsx';
import { Link } from 'react-router-dom';
import Pagination from '../../view/component/Pagination.jsx';
import FileSaver from 'file-saver'

class AdminDuyetDonDeNghiHoc extends React.Component {
    constructor(props) {
        super(props);
        this.state = { searchText: '', isSearching: false };
    }

    ready = () => {
        inView('.listViewLoading').on('enter', () => {
            let adminForm = this.props.donDeNghiHoc;
            if (!this.loading && this.props.getFormInPage && adminForm && adminForm.pageNumber < adminForm.pageTotal) {
                this.loading = true;
                this.props.getFormInPage(adminForm.pageNumber + 1, T.defaultUserPageSize, () => this.loading = false);
            }
        });
    }

    componentDidMount() {
        T.ready('user/don-de-nghi-hoc');
        this.props.getFormInPage(1, T.defaultUserPageSize, () => this.loading = false);
    }

    exportDonDeNghiHoc = (e, item) => {
        this.props.exportDonDeNghiHocToWord(item._id, (data) => {
            FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Đơn Đề Nghị Học.docx');
        });
    };
    exportBienNhan = (e, item) => {
        this.props.exportBienNhanLanDauToWord(item._id, (data) => {
            FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Biên Nhận Hồ Sơ Học Viên Lần Đầu.docx');
        });
    };

    exportBanCamKet = (e, item) => {
        this.props.exportBanCamKetToWord(item._id, (data) => {
            FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Bản Cam Kết.docx');
        });
    };

    search = (e) => {
        e.preventDefault();
        let condition = {},
            searchText = $('#searchTextBox').val();
        if (searchText) condition.searchText = searchText;

        this.props.getFormInPage(undefined, undefined, condition, () => {
            const isSearching = Object.keys(condition).length > 0;
            this.setState({ searchText, isSearching });
        });
    };

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermission.contains('user-form:write');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.donDeNghiHoc && this.props.donDeNghiHoc.page ?
            this.props.donDeNghiHoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const table = list && list.length ? (
            <table className='table table-hover table-bordered'>
                <thead>
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '75%' }}>Người dùng</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Trạng thái</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {list.slice(0).reverse().map((item, index) => (
                        <tr key={index}>
                            <td style={{ textAlign: 'right' }}>{(Math.max(pageNumber - 1, 0)) * pageSize + index + 1}</td>
                            <td>
                                <Link to={'/user/don-de-nghi-hoc-chi-tiet/item/' + item._id}>{item.user.lastname + ' ' + item.user.firstname}</Link>
                            </td>
                            <td>
                                {(item.approve === 'waiting' ? 'Mới' : (item.approve === 'approved' ? 'Đã duyệt' : 'Từ chối'))}
                            </td>
                            <td className='btn-group'>
                                <Link to={'/user/don-de-nghi-hoc-chi-tiet/item/' + item._id} data-id={item._id} className='btn btn-warning'>
                                    <i className='fa fa-lg fa-list-alt' />
                                </Link>
                                <button type='button' className='btn btn-success' title='Xuất Đơn Đề Nghị Học Thành Word'
                                    onClick={e => this.exportDonDeNghiHoc(e, item)}>
                                    <i className="fa fa-file-word-o"></i>
                                </button>
                                <button type='button' className='btn btn-info' title='Xuất Biên Nhận Học Viên Thành Word'
                                    onClick={e => this.exportBienNhan(e, item)}>
                                    <i className="fa fa-file-text-o"></i>
                                </button>
                                <button type='button' className='btn btn-secondary' title='Xuất Bản Cam Kết Thành Word'
                                    onClick={e => this.exportBanCamKet(e, item)}>
                                    <i className="fa fa-file-text-o"></i>
                                </button>
                                {!readOnly ?
                                    <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                        <i className='fa fa-lg fa-trash' />
                                    </a> : null
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : <p>Không có biểu mẫu mới!</p>;

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file-text-o' /> Danh sách Đơn đề nghị học, sát hạch để cấp giấy phép lái xe</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <form style={{ position: 'relative', border: '1px solid #ddd', marginRight: 6 }} onSubmit={e => this.search(e)}>
                            <input className='app-search__input' id='searchTextBox' type='search' placeholder='Tìm kiếm người dùng' />
                            <a href='#' style={{ position: 'absolute', top: 6, right: 9 }} onClick={e => this.search(e)}><i className='fa fa-search' /></a>
                        </form>
                        {this.state.isSearching ?
                            <a href='#' onClick={e => $('#searchTextBox').val('') && this.search(e)} style={{ color: 'red', marginRight: 12, marginTop: 6 }}>
                                <i className='fa fa-trash' />
                            </a> : null}
                    </ul>
                </div>

                <div className='row tile'>
                    {table}
                </div>
                <Pagination name='pageForm' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getFormInPage} />
                {!readOnly ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.create}>
                        <i className='fa fa-lg fa-plus' />
                    </button> : null
                }
            </main>
        );
    }
}

const mapStateToProps = state => ({ donDeNghiHoc: state.donDeNghiHoc, system: state.system, user: state.user });
const mapActionsToProps = { getFormInPage, createForm, updateForm, deleteForm, getUserInPage, exportDonDeNghiHocToWord, exportBienNhanLanDauToWord, exportBanCamKetToWord };
export default connect(mapStateToProps, mapActionsToProps)(AdminDuyetDonDeNghiHoc);
