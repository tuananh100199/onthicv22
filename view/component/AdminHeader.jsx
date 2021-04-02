import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateSystemState, logout } from 'modules/_default/_init/redux';
import { getUnreadContacts, getContact } from 'modules/mdTruyenThong/fwContact/redux';
import { changeRole } from 'modules/_default/fwRole/redux';
import { switchUser, ajaxSelectUser } from 'modules/_default/fwUser/redux';
import ContactModal from './AdminContactModal';
import { AdminModal, FormSelect } from 'view/component/AdminPage';

class DebugModal extends AdminModal {
    onShow = () => this.userSelect.value(null);

    onSubmit = () => this.props.switchUser(this.userSelect.value());

    render = () => this.renderModal({
        title: 'Switch user',
        body: <FormSelect ref={e => this.userSelect = e} label='Select user' data={ajaxSelectUser} />,
    });
}

class AdminHeader extends React.Component {
    state = { showContact: false };

    componentDidMount() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const showContact = currentPermissions.contains('contact:read');
        if (showContact) this.props.getUnreadContacts((_, error) => error && this.setState({ showContact: true }));

        T.showSearchBox = () => this.searchBox && $(this.searchBox).parent().css('display', 'flex');
        T.hideSearchBox = () => this.searchBox && $(this.searchBox).parent().css('display', 'none');
        T.clearSearchBox = () => {
            if (this.searchBox) this.searchBox.value = '';
        }
    }

    showContact = (e, contactId) => e.preventDefault() || this.props.getContact(contactId, contact => this.contactModal.show(contact));

    logout = (e) => e.preventDefault() || this.props.logout();

    search = (e) => e.preventDefault() || T.onSearch && T.onSearch(this.searchBox.value);

    debugAsRole = (e, role) => e.preventDefault() || this.props.changeRole(role, user => this.props.updateSystemState({ user }));

    showDebugModal = e => e.preventDefault() || this.debugModal.show();

    renderContact = () => {
        let list = this.props.contact && this.props.contact.unreads && this.props.contact.unreads.length > 0 ?
            this.props.contact.unreads.map((item, index) => (
                <li key={index}>
                    <a className='app-notification__item' href='#' onClick={e => this.showContact(e, item._id)}>
                        <span className='app-notification__icon'>
                            <span className='fa-stack fa-lg'>
                                <i className='fa fa-circle fa-stack-2x text-primary' />
                                <i className='fa fa-envelope fa-stack-1x fa-inverse' />
                            </span>
                        </span>
                        <div>
                            <p className='app-notification__message' style={{ fontWeight: 'bold' }}>{item.subject}</p>
                            <p className='app-notification__meta'>{new Date(item.createdDate).getText()}</p>
                        </div>
                    </a>
                </li>)) : '';
        let notificationTitle = list.length > 0 ? 'Bạn có ' + list.length + ' liên hệ mới' : 'Bạn không có liên hệ mới';
        return (
            <li className='dropdown'>
                <a className='app-nav__item' href='#' data-toggle='dropdown' aria-label='Show notifications'>
                    <i className='fa fa-bell-o fa-lg' />
                </a>
                <ul className='app-notification dropdown-menu dropdown-menu-right'>
                    <li className='app-notification__title'>{notificationTitle}</li>
                    <div className='app-notification__content'>
                        {list}
                    </div>
                    <li className='app-notification__footer'>
                        <Link to='/user/contact'>Đến trang Liên hệ</Link>
                    </li>
                </ul>
            </li>
        );
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const isDebug = this.props.system && this.props.system.isDebug,
            isAdmin = this.props.system && this.props.system.user && this.props.system.user.roles.some(role => role.name == 'admin');

        return <>
            <header className='app-header' >
                <a className='app-header__logo' href='/'>Hiệp Phát</a>
                <a className='app-sidebar__toggle' href='#' data-toggle='sidebar' aria-label='Hide Sidebar' />
                <ul className='app-nav'>
                    {isAdmin || isDebug ?
                        <li className='app-nav__item' style={{ whiteSpace: 'nowrap' }}>
                            <a href='#' style={{ color: 'white' }} onClick={this.showDebugModal}>Switch user</a>
                        </li> : null}
                    <li className='app-search' style={{ display: 'none' }}>
                        <input ref={e => this.searchBox = e} className='app-search__input' type='search' placeholder='Tìm kiếm' onKeyUp={e => e.keyCode == 13 && this.search(e)} />
                        <button className='app-search__button' onClick={this.search}><i className='fa fa-search' /></button>
                    </li>
                    {this.state.showContact ? this.renderContact(currentPermissions) : null}
                    <li>
                        <Link className='app-nav__item' to='/user'>
                            <i className='fa fa-user fa-lg' />
                        </Link>
                    </li>
                    <li>
                        <a className='app-nav__item' href='#' onClick={this.logout}>
                            <i className='fa fa-power-off fa-lg' style={{ color: 'red' }} />
                        </a>
                    </li>
                </ul>
            </header>
            <ContactModal ref={e => this.contactModal = e} />
            <DebugModal ref={e => this.debugModal = e} switchUser={this.props.switchUser} updateSystemState={this.props.updateSystemState} />
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, contact: state.contact, role: state.role });
const mapActionsToProps = { getUnreadContacts, getContact, changeRole, updateSystemState, logout, switchUser };
export default connect(mapStateToProps, mapActionsToProps)(AdminHeader);