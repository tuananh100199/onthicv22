import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ContactModal from './AdminContactModal';
import { getUnreadContacts, getContact } from 'modules/mdTruyenThong/fwContact/redux';
import { changeRole } from 'modules/_default/fwRole/redux';
import { switchUser } from 'modules/_default/fwUser/redux';
import { updateSystemState, logout } from 'modules/_default/_init/reduxSystem';
import { Select } from './Input';
import { ajaxSelectUser } from 'modules/_default/fwUser/redux';

class DebugModal extends React.Component {
    modal = React.createRef();
    userSelect = React.createRef();

    show = () => {
        this.userSelect.current.val(null);
        $(this.modal.current).modal('show');
    }

    switchUser = () => {
        const userId = this.userSelect.current.val();
        this.props.switchUser(userId);
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <div className='modal-dialog' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Switch user</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label>Select user</label>
                                <Select ref={this.userSelect} displayLabel={false} adapter={ajaxSelectUser} placeholder='Select user' />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>
                                <i className='fa fa-fw fa-lg fa-times' />Close</button>
                            <button type='button' className='btn btn-success' onClick={this.switchUser}>
                                <i className='fa fa-fw fa-lg fa-refresh' />Switch</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class AdminHeader extends React.Component {
    state = { showContact: true };
    searchBox = React.createRef();
    contactModal = React.createRef();
    debugModal = React.createRef();

    componentDidMount() {
        this.props.getUnreadContacts((_, error) => error && this.setState({ showContact: false }));
    }

    showContact = (e, contactId) => {
        e.preventDefault();
        this.props.getContact(contactId, contact => this.contactModal.current.show(contact));
    }

    logout = (e) => {
        e.preventDefault();
        this.props.logout();
    }

    search = (e) => {
        e.preventDefault();
        T.onSearch && T.onSearch(this.searchBox.current.value);
    }

    debugAsRole = (e, role) => {
        e.preventDefault();
        this.props.changeRole(role, user => this.props.updateSystemState({ user }));
    }

    showDebugModal = e => {
        e.preventDefault();
        this.debugModal.current.show();
    }

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
        const isDebug = this.props.system && this.props.system.isDebug,
            isAdmin = this.props.system && this.props.system.user && this.props.system.user.roles.some(role => role.name == 'admin');

        return [
            <header key={0} className='app-header' >
                <Link className='app-header__logo' to='/user'>Hiệp Phát</Link>
                <a className='app-sidebar__toggle' href='#' data-toggle='sidebar' aria-label='Hide Sidebar' />
                <ul className='app-nav'>
                    {isAdmin || isDebug ?
                        <li className='app-nav__item'>
                            <a href='#' style={{ color: 'white' }} onClick={this.showDebugModal}>Switch user</a>
                        </li> : null}
                    <li className='app-search'>
                        <input ref={this.searchBox} className='app-search__input' type='search' placeholder='Tìm kiếm' onKeyUp={e => e.keyCode == 13 && this.search(e)} />
                        <button className='app-search__button' onClick={this.search}><i className='fa fa-search' /></button>
                    </li>
                    {this.state.showContact ? this.renderContact() : null}
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
            </header>,
            <ContactModal key={1} ref={this.contactModal} />,
            <DebugModal key={2} ref={this.debugModal} switchUser={this.props.switchUser} updateSystemState={this.props.updateSystemState} />
        ];
    }
}

const mapStateToProps = state => ({ system: state.system, contact: state.contact, role: state.role });
const mapActionsToProps = { getUnreadContacts, getContact, changeRole, updateSystemState, logout, switchUser };
export default connect(mapStateToProps, mapActionsToProps)(AdminHeader);