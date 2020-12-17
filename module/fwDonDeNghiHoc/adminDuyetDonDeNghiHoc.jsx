import React from 'react';
import { connect } from 'react-redux';
import { getFormInPage, createForm, updateForm, deleteForm } from './redux.jsx';
import { getUserInPage } from '../fwUser/redux.jsx';
import { getUser } from '../fwUser/redux.jsx';
import { Link } from 'react-router-dom';
import Pagination from '../../view/component/Pagination.jsx';

class AdminDuyetDonDeNghiHoc extends React.Component {
    constructor(props) {
        super(props);
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
        this.props.getFormInPage(1, T.defaultUserPageSize, () => this.loading = false);
        this.props.getUserInPage(1, T.defaultUserPageSize, () => this.loading = false)
    }



    render() {
        console.log(this.props)
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermission.contains('user-form:write');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.donDeNghiHoc && this.props.donDeNghiHoc.page ?
            this.props.donDeNghiHoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const table = list && list.length ? (
            <table className='table table-hover table-bordered'>
                <thead>
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '80%' }}>Người dùng</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map((item, index) => (
                        <tr key={index}>
                            <td style={{ textAlign: 'right' }}>{(Math.max(pageNumber - 1, 0)) * pageSize + index + 1}</td>
                            <td>
                                <Link to={'/user/don-de-nghi-hoc-chi-tiet/item/' + item._id}>{item.user.lastname + ' ' + item.user.firstname}</Link>
                            </td>
                            <td className='btn-group'>
                                <Link to={'/user/form/registration/' + item._id} data-id={item._id} className='btn btn-warning'>
                                    <i className='fa fa-lg fa-list-alt' />
                                </Link>
                                <Link to={'/user/user-form/edit/' + item._id} className='btn btn-primary'>
                                    <i className='fa fa-lg fa-edit' />
                                </Link>
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
                    <h1><i className='fa fa-file-text-o' /> Danh sách Đơn đề nghị học, sát hạch để cấp giấy phép lái xe
</h1>
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
const mapActionsToProps = { getFormInPage, createForm, updateForm, deleteForm, getUserInPage };
export default connect(mapStateToProps, mapActionsToProps)(AdminDuyetDonDeNghiHoc);
