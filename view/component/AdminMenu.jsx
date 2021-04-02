import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class AdminMenu extends React.Component {
    componentDidMount() {
        T.ready(() => {
            // Toggle Sidebar
            $(`[data-toggle='sidebar']`).click(function (event) {
                $('.app').toggleClass('sidenav-toggled');
                event.preventDefault();
            });

            // Activate sidebar treeview toggle
            $(`[data-toggle='treeview']`).click(function (event) {
                if (!$(this).parent().hasClass('is-expanded')) {
                    $('.app-menu').find(`[data-toggle='treeview']`).parent().removeClass('is-expanded');
                }
                $(this).parent().toggleClass('is-expanded');
                event.preventDefault();
            });

            // Set initial active toggle
            $(`[data-toggle='treeview.'].is-expanded`)
                .parent()
                .toggleClass('is-expanded');

            //Activate bootstrip tooltips
            $(`[data-toggle='tooltip']`).tooltip();
        });
    }

    render() {
        let { user = null } = this.props.system ? this.props.system : {};
        if (user == null) user = { firstname: 'firstname', lastname: 'lastname', role: '', isStaff: false, isStudent: false };
        if (user.image == null) user.image = '/img/avatar.png';

        const menus = [];
        if (user.menu) {
            Object.keys(user.menu).sort().forEach((menuIndex) => {
                const userMenuItem = user.menu[menuIndex], parentMenu = userMenuItem.parentMenu;
                if (parentMenu) {
                    const submenuIndexes = userMenuItem.menus ? Object.keys(userMenuItem.menus).sort() : [];
                    if (parentMenu.subMenusRender && submenuIndexes.length) {
                        menus.push(
                            <li key={menus.length} className='treeview'>
                                <a className='app-menu__item' href='#' data-toggle='treeview'>
                                    <i className={'app-menu__icon fa ' + parentMenu.icon} />
                                    <span className='app-menu__label'>{parentMenu.title}</span>
                                    <i className='treeview-indicator fa fa-angle-right' />
                                </a>
                                <ul className='treeview-menu'>
                                    {submenuIndexes.map((menuIndex, key) => (
                                        <li key={key}>
                                            <Link className='treeview-item' to={userMenuItem.menus[menuIndex].link}>
                                                <i className='icon fa fa-circle-o' />{userMenuItem.menus[menuIndex].title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        );
                    } else {
                        menus.push(
                            <li key={menus.length}>
                                <Link className='app-menu__item' to={parentMenu.link}>
                                    <i className={'app-menu__icon fa ' + parentMenu.icon} />
                                    <span className='app-menu__label'>{parentMenu.title}</span>
                                </Link>
                            </li>
                        );
                    }
                }
            });
        }

        return <>
            <div className='app-sidebar__overlay' data-toggle='sidebar' />
            <aside className='app-sidebar'>
                <Link to='/user' style={{ textDecoration: 'none' }}>
                    <div className='app-sidebar__user'>
                        <img className='app-sidebar__user-avatar' src={user.image} alt='Avatar' style={{ width: '48px', height: 'auto' }} />
                        <p className='app-sidebar__user-name' style={{ marginBottom: 0 }}>{user.firstname + ' ' + user.lastname}</p>
                    </div>
                    <p className='app-sidebar__user-designation'>{user.email}</p>
                </Link>
                <ul className='app-menu'>
                    {menus}
                </ul>
            </aside>
        </>;
    }
}

const mapStateToProps = (state) => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(AdminMenu);
