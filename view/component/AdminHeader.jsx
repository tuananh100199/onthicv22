import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ContactModal from './AdminContactModal.jsx';
import { getUnreadContacts, getContact } from '../../module/fwContact/redux.jsx';
import { changeRole } from '../../module/fwRole/redux.jsx';
import { updateSystemState, logout } from '../../module/_init/reduxSystem.jsx';

class AdminHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = { showContact: true };
        this.contactModal = React.createRef();
    }

    componentDidMount() {
        this.props.getUnreadContacts((_, error) => {
            error && this.setState({ showContact: false });
        });
    }

    showContact = (e, contactId) => {
        e.preventDefault();
        this.props.getContact(contactId, contact => this.contactModal.current.show(contact));
    }

    logout = (e) => {
        e.preventDefault();
        this.props.logout();
    }

    debugAsRole = (e, role) => {
        this.props.changeRole(role, user => this.props.updateSystemState({ user }));
        e.preventDefault();
    }

    genClassName = (_id) => {
        if (this.props.system && this.props.system.user) {
            const roles = this.props.system.user.roles;
            return roles && roles.contains(_id) ? 'btn btn-success' : 'btn btn-light';
        } else {
            return 'btn btn-light';
        }
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
        return [
            <header key={0} className='app-header' >
                <Link className='app-header__logo' to='/user'>Code Tutorial</Link>
                <a className='app-sidebar__toggle' href='#' data-toggle='sidebar' aria-label='Hide Sidebar' />
                <ul className='app-nav'>
                    {this.props.system && this.props.system.isDebug && this.props.system.roles && this.props.system.roles.length ? (
                        <li className='dropdown'>
                            <a className='app-nav__item' href='#' data-toggle='dropdown' aria-label='Show notifications'>
                                Debug as &nbsp;<span style={{ color: '#00F' }}>{(this.props.system.user ? this.props.system.user.roles : []).map(role => role.name.toUpperCase()).toString()}</span>
                            </a>
                            <ul className='app-notification dropdown-menu dropdown-menu-right'>
                                {this.props.system.roles.map((item, index) =>
                                    <li key={index} className='app-notification__title' style={{ width: '100%' }}>
                                        <a href='#' style={{ color: 'black', width: '100%', display: 'block' }} onClick={(e) => this.debugAsRole(e, item)}>{item.name}</a>
                                    </li>
                                )}
                            </ul>
                        </li>
                    ) : ''}
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
            <ContactModal key={1} ref={this.contactModal} />
        ];
    }
}

const mapStateToProps = state => ({ system: state.system, contact: state.contact, role: state.role });
const mapActionsToProps = { getUnreadContacts, getContact, changeRole, updateSystemState, logout };
export default connect(mapStateToProps, mapActionsToProps)(AdminHeader);