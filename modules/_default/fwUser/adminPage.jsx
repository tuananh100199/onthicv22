import React from 'react';
import { connect } from 'react-redux';
import { getUserInPage, createUser, updateUser, deleteUser } from './redux';
import { getAllRoles } from '../fwRole/redux';
import Pagination from 'view/component/Pagination';
import { UserPasswordModal, RolesModal, UserModal } from './adminModal';

class UserPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { searchText: '', isSearching: false };
        this.userModal = React.createRef();
        this.passwordModal = React.createRef();
        this.rolesModal = React.createRef();
    }

    componentDidMount() {
        this.props.getAllRoles();
        T.ready('/user/settings', () => {
            this.props.getUserInPage(1, 50, {});
        });
    }

    edit = (e, item) => {
        e.preventDefault();
        this.userModal.current.show(item);
    };

    editRoles = (e, item) => {
        e.preventDefault();
        this.rolesModal.current.show(item);
    };

    changePassword = (e, item) => {
        e.preventDefault();
        this.passwordModal.current.show(item);
    };

    changeActive = item => this.props.updateUser(item._id, { active: !item.active })

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Người dùng: Xóa người dùng', 'Bạn có chắc bạn muốn xóa người dùng này?', true, isConfirm =>
            isConfirm && this.props.deleteUser(item._id));
    };

    search = (e) => {
        e.preventDefault();
        let condition = {},
            searchText = $('#searchTextBox').val();
        if (searchText) condition.searchText = searchText;

        this.props.getUserInPage(undefined, undefined, condition, () => {
            const isSearching = Object.keys(condition).length > 0;
            this.setState({ searchText, isSearching });
        });
    };

    render() {
        const permissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            hasUpdate = permissions.includes('user:write');
        const allRoles = this.props.role && this.props.role.items ? this.props.role.items : [];
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.user && this.props.user.page ?
            this.props.user.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: null };
        let table = 'Không có người dùng!';
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered table-responsive'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '70%' }}>Tên</th>
                            <th style={{ width: '30%' }}>Email</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình ảnh</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Vai trò</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.user.page.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.lastname + ' ' + item.firstname}</a></td>
                                <td>{item.email}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <img src={item.image ? item.image : '/img/avatar.png'} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                <td style={{ textAlign: 'left' }}>
                                    {hasUpdate ? (
                                        <a href='#' onClick={e => this.editRoles(e, item)}>
                                            {item.roles ? item.roles.map((role, index) => <label style={{ whiteSpace: 'nowrap' }} key={index}>_ {role.name}</label>) : ''}
                                        </a>
                                    ) : (item.roles ? item.roles : []).map((role, index) => <label style={{ whiteSpace: 'nowrap' }} key={index}>_ {role.name}</label>)}
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.active} onChange={() => this.changeActive(item, index)} disabled={!hasUpdate} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {hasUpdate ? <a className='btn btn-info' href='#' onClick={e => this.changePassword(e, item)}><i className='fa fa-lg fa-key' /></a> : ''}
                                        {item.default || !hasUpdate ? null :
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}><i className='fa fa-lg fa-trash' /></a>}
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
                    <div>
                        <h1><i className='fa fa-user' /> Người dùng</h1>
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <form style={{ position: 'relative', border: '1px solid #ddd', marginRight: 6 }} onSubmit={e => this.search(e)}>
                            <input className='app-search__input' id='searchTextBox' type='search' placeholder='Search' />
                            <a href='#' style={{ position: 'absolute', top: 6, right: 9 }} onClick={e => this.search(e)}><i className='fa fa-search' /></a>
                        </form>
                        {this.state.isSearching ?
                            <a href='#' onClick={e => $('#searchTextBox').val('') && this.search(e)} style={{ color: 'red', marginRight: 12, marginTop: 6 }}>
                                <i className='fa fa-trash' />
                            </a> : null}
                    </ul>
                </div>

                <div className='tile'>{table}</div>
                <Pagination name='adminUser' pageCondition={pageCondition}
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getUserInPage} />

                {hasUpdate ? (
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>
                ) : ''}

                <UserModal ref={this.userModal} hasUpdate={hasUpdate}
                    allRoles={allRoles}
                    updateUser={this.props.updateUser} createUser={this.props.createUser} getPage={this.props.getUserInPage} />
                <RolesModal ref={this.rolesModal} hasUpdate={hasUpdate}
                    allRoles={allRoles}
                    updateUser={this.props.updateUser} getPage={this.props.getUserInPage} />
                <UserPasswordModal updateUser={this.props.updateUser} hasUpdate={hasUpdate} ref={this.passwordModal} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, user: state.user, role: state.role });
const mapActionsToProps = { getUserInPage, createUser, updateUser, deleteUser, getAllRoles };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);
