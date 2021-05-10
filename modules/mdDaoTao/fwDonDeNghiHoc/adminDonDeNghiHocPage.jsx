import React from 'react';
import { connect } from 'react-redux';
import { getFormInPage, createForm, updateForm, deleteForm, exportDonDeNghiHocToWord, exportBienNhanLanDauToWord, exportBanCamKetToWord } from './redux';
import { getUserPage } from 'modules/_default/fwUser/redux';
import { Link } from 'react-router-dom';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import FileSaver from 'file-saver';
import Tooltip from 'rc-tooltip';

class AdminDonDeNghiHocPage extends React.Component {
    state = { searchText: '', isSearching: true };

    componentDidMount() {
        let url = window.location.pathname,
            params = T.routeMatcher('/user/don-de-nghi-hoc/list/:licenseClass').parse(url);
        T.ready('/user/don-de-nghi-hoc', () => {
            this.props.getFormInPage(undefined, undefined, {}, params.licenseClass, () => {
                this.setState({ isSearching: false });
            });
        });
    }

    exportDonDeNghiHoc = (e, item) => {
        this.props.exportDonDeNghiHocToWord(item._id, (data) => {
            FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Đơn Đề Nghị Học.docx');
        });
    }

    exportBienNhan = (e, item) => {
        this.props.exportBienNhanLanDauToWord(item._id, (data) => {
            FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Biên Nhận Hồ Sơ Học Viên Lần Đầu.docx');
        });
    }

    exportBanCamKet = (e, item) => {
        this.props.exportBanCamKetToWord(item._id, (data) => {
            FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Bản Cam Kết.docx');
        });
    }

    search = (e) => {
        let url = window.location.pathname,
            params = T.routeMatcher('/user/don-de-nghi-hoc/list/:licenseClass').parse(url);
        e.preventDefault();
        let condition = {},
            searchText = $('#searchTextBox').val();
        if (searchText) condition.searchText = searchText;

        this.setState({ isSearching: true }, () => {
            this.props.getFormInPage(undefined, undefined, condition, params.licenseClass, () => {
                this.setState({ searchText, isSearching: false });
            });
        });
    }

    render() {
        let url = window.location.pathname,
            params = T.routeMatcher('/user/don-de-nghi-hoc/list/:licenseClass').parse(url);
        // const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.donDeNghiHoc && this.props.donDeNghiHoc.page ?
            this.props.donDeNghiHoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const table = list && list.length ? (
            <table className='table table-hover table-bordered'>
                <thead>
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '85%' }}>Người dùng</th>
                        {/* <th style={{ width: 'auto', textAlign: 'center' }}>Hạng</th> */}
                        <th style={{ width: '15%', textAlign: 'center' }} nowrap='true'>Trạng thái</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map((item, index) => (
                        <tr key={index}>
                            <td style={{ textAlign: 'right' }}>{(Math.max(pageNumber - 1, 0)) * pageSize + index + 1}</td>
                            <td>
                                <Link to={'/user/don-de-nghi-hoc/edit/' + item._id}>{item.user.lastname + ' ' + item.user.firstname}</Link>
                            </td>
                            {/* <td>{item.newLicenseClass}</td> */}
                            <td>
                                {(item.status == 'waiting' ? 'Chờ duyệt' :
                                    (item.status == 'approved' ? <span className='text-success'>Đã duyệt</span> :
                                        (item.status == 'reject' ? <span className='text-danger'>Từ chối</span> :
                                            (item.status == 'progressing' ? <span className='text-primary'>Đang theo học</span>
                                                : <span className='text-warning'>Đã hoàn thành</span>)
                                        )
                                    )
                                )}
                            </td>
                            <td className='btn-group'>
                                <Link to={'/user/don-de-nghi-hoc/edit/' + item._id} data-id={item._id} className='btn btn-primary'>
                                    <i className='fa fa-lg fa-edit' />
                                </Link>
                                <Tooltip placement='bottom' overlay='Xuất đơn đề nghị học'>
                                    <button type='button' className='btn btn-success' onClick={e => this.exportDonDeNghiHoc(e, item)}>
                                        <i className='fa fa-file-word-o' />
                                    </button>
                                </Tooltip>
                                <Tooltip placement='bottom' overlay='Xuất biên nhận học viên'>
                                    <button type='button' className='btn btn-info' onClick={e => this.exportBienNhan(e, item)}>
                                        <i className='fa fa-file-text-o' />
                                    </button>
                                </Tooltip>
                                <Tooltip placement='bottom' overlay='Xuất bản cam kết'>
                                    <button type='button' className='btn btn-secondary' onClick={e => this.exportBanCamKet(e, item)}>
                                        <i className='fa fa-file-text-o' />
                                    </button>
                                </Tooltip>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : <p>Không có đơn chờ duyệt!</p>;

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file-text-o' /> {'Danh sách Đơn đề nghị học, sát hạch để cấp giấy phép lái xe hạng ' + params.licenseClass}</h1>
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

                <div className='tile'>{!this.state.isSearching ? table : <OverlayLoading text='Đang tải..' />}</div>
                <Link className='btn btn-secondary btn-circle' to='/user/don-de-nghi-hoc' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                <Pagination name='pageForm' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getFormInPage} style={{ marginLeft: '65px' }} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ donDeNghiHoc: state.donDeNghiHoc, system: state.system, user: state.framework.user });
const mapActionsToProps = { getFormInPage, createForm, updateForm, deleteForm, getUserPage, exportDonDeNghiHocToWord, exportBienNhanLanDauToWord, exportBanCamKetToWord };
export default connect(mapStateToProps, mapActionsToProps)(AdminDonDeNghiHocPage);
