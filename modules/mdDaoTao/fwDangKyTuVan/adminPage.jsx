import React from 'react';
import { connect } from 'react-redux';
import { getAllDangKyTuVan, createDangKyTuVan, deleteDangKyTuVan } from './redux/reduxDangKyTuVan';
import { Link } from 'react-router-dom';

class DangKyTuVanPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getAllDangKyTuVan();
        $('#neNewsCategories').select2();
    }

    create = (e) => {
        this.props.createDangKyTuVan(data => this.props.history.push('/user/dang-ky-tu-van/edit/' + data.item._id));
        e.preventDefault();
    }

    show = (item) => {
        this.props.history.push('/user/dang-ky-tu-van/edit/' + item._id);
    }

    delete = (e, item) => {
        T.confirm('Xóa nhóm thống kê', 'Bạn có chắc bạn muốn xóa nhóm thống kê này?', true, isConfirm => isConfirm && this.props.deleteDangKyTuVan(item._id));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('component:write');
        let table = 'Không có nhóm thống kê!';
        if (this.props.dangKyTuVan && this.props.dangKyTuVan.list && this.props.dangKyTuVan.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tên nhóm</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.dangKyTuVan.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    <Link to={'/user/dang-ky-tu-van/edit/' + item._id} data-id={item._id}>
                                        {T.language.parse(item.title)}
                                    </Link>
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        <Link to={'/user/dang-ky-tu-van/edit/' + item._id} data-id={item._id} className='btn btn-primary' data-toggle='tooltip' title='Chỉnh sửa'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>
                                        {currentPermissions.includes('component:write') ?
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
            <>
                {table}
                {permissionWrite ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.create}>
                        <i className='fa fa-lg fa-plus' />
                    </button> : null}
            </>);
    }
}

const mapStateToProps = state => ({ system: state.system, dangKyTuVan: state.dangKyTuVan });
const mapActionsToProps = { getAllDangKyTuVan, createDangKyTuVan, deleteDangKyTuVan };
export default connect(mapStateToProps, mapActionsToProps)(DangKyTuVanPage);