import React from 'react';
import { connect } from 'react-redux';
import { getDangKyTuVanInPage, createDangKyTuVan, updateDangKyTuVan, deleteDangKyTuVan } from './redux/reduxDangKyTuVan.jsx'
import { Link } from 'react-router-dom';
import Pagination from '../../view/component/Pagination.jsx';

class DangKyTuVanPage extends React.Component {
    componentDidMount() {
        this.props.getDangKyTuVanInPage();
        T.ready();
    }

    create = (e) => {
        this.props.createDangKyTuVan(data => this.props.history.push('/user/dang-ky-tu-van/edit/' + data.item._id));
        e.preventDefault();
    }

    delete = (e, item) => {
        T.confirm('Đăng ký tư vấn', 'Bạn có chắc bạn muốn xóa đăng ký tư vấn này?', 'warning', true, isConfirm => isConfirm && this.props.deleteDangKyTuVan(item._id));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
        { pageNumber, pageSize, pageTotal, totalItem } = this.props.dangKyTuVan && this.props.dangKyTuVan.page ?
            this.props.dangKyTuVan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        let table = 'Không có đăng ký tư vấn!';
        if (this.props.dangKyTuVan && this.props.dangKyTuVan.page && this.props.dangKyTuVan.page.list && this.props.dangKyTuVan.page.list.length > 0) {
            const { list } = this.props.dangKyTuVan.page ? this.props.dangKyTuVan.page : { list: [] };

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
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    <Link to={'/user/dang-ky-tu-van/edit/' + item._id}>{item.title}</Link>
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        <Link to={'/user/dang-ky-tu-van/edit/' + item._id} data-id={item._id} className='btn btn-primary'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>

                                        {currentPermissions.contains('dangKyTuVan:write') ?
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
                    <h1><i className='fa fa-file' /> Đăng ký tư vấn: Danh sách</h1>
                </div>
                <div className='row tile'>{table}</div>
                <Pagination name='pageDangKyTuVan'
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getDangKyTuVanInPage} />
                {currentPermissions.contains('dangKyTuVan:write') ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                        onClick={this.create}>
                        <i className='fa fa-lg fa-plus' />
                    </button> : ''}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dangKyTuVan: state.dangKyTuVan });
const mapActionsToProps = { getDangKyTuVanInPage, createDangKyTuVan, updateDangKyTuVan, deleteDangKyTuVan };
export default connect(mapStateToProps, mapActionsToProps)(DangKyTuVanPage);
