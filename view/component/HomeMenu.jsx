import React from 'react';
import { connect } from 'react-redux';
import { logout } from '../../module/_init/reduxSystem.jsx';
import { Link } from 'react-router-dom';
import SectionLastNew from '../../module/fwHome/sectionLastNew.jsx';
import SectionVideo from '../../module/fwHome/sectionVideo.jsx';

// const texts = {
//     vi: {
//         // loginButton: 'Đăng nhập | Đăng ký',
//         loginButton: 'Đăng nhập',
//         logoutButton: 'Đăng xuất',
//     },
//     en: {
//         // loginButton: 'Sign in | Sign up',
//         loginButton: 'Sign in',
//         logoutButton: 'Sign out',
//     }
// };

class HomeMenu extends React.Component {
    constructor(props) {
        super(props);
        this.nav = React.createRef();
    }

    componentDidMount() {
        const done = () => {
            if ($.fn.classyNav && this.nav.current != null && $(this.nav.current).length > 0 && this.props.system && this.props.system.menus) {
                $(this.nav.current).classyNav();
                $('.clever-main-menu').sticky({ topSpacing: 0 });
            } else {
                setTimeout(done, 100);
            }
        };
        $(document).ready(done);
    }

    onMenuClick = () => {
        $('.classy-menu').removeClass('menu-on')
    };

    logout = (e) => {
        e.preventDefault();
        if (this.props.system && this.props.system.user) {
            this.props.logout();
        }
    };

    render() {
        let menus = [];
        if (this.props.system && this.props.system.menus) {
            menus = this.props.system.menus.map((item, index) => {
                if (typeof item.length === 'number') {
                    return null;
                } else {
                    let link = item.link ? item.link.toLowerCase().trim() : '/',
                        isExternalLink = link.startsWith('http://') || link.startsWith('https://');
                    link = item.link ? item.link : '#';
                    const title = T.language.parse(item.title);

                    return (item.submenus && item.submenus.length > 0) ? (
                        <li key={index}>
                            {isExternalLink ? <a href={link} target='_blank'>{title}</a> : (item.link ? <Link to={link} onClick={this.onMenuClick}>{title}</Link> :
                                <a href='#' onClick={e => e.preventDefault()}>{title}</a>)}
                            <ul className='dropdown'>{
                                item.submenus.map((subMenu, subIndex) => {
                                    const link = subMenu.link ? subMenu.link.toLowerCase().trim() : '/';
                                    if (subMenu.title == '-') {
                                        return <li key={subIndex}>---</li>;
                                    } else {
                                        return isExternalLink ?
                                            <a key={subIndex} href={link}>{T.language.parse(subMenu.title)}</a> :
                                            <Link key={subIndex} to={link} onClick={this.onMenuClick}>{T.language.parse(subMenu.title)}</Link>
                                    }
                                })}
                            </ul>
                        </li>
                    ) :
                        <li key={index}>
                            {isExternalLink ? <a href={link} target='_blank'>{title}</a> :
                                (link.startsWith('#') ? <a href={link}>{item.title}</a> : <Link to={link} onClick={this.onMenuClick}>{title}  </Link>)}
                        </li>;
                }
            });
        }

        const { logo, user } = this.props.system ? this.props.system : {};
        return (
            <header className='header-area'>
                <div className='clever-main-menu'>
                    <div className='classy-nav-container breakpoint-off'>
                        <nav className='classy-navbar justify-content-between' ref={this.nav} id='cleverNav'>
                            <Link className='navbar-brand' to='/' style={{ display: 'flex' }}>
                                {logo ? <img src={logo} style={{ height: '36px', width: 'auto' }} alt='logo' /> : ''}&nbsp;
                                <h4>Trung tâm đào tạo lái xe Hiệp Phát</h4>
                            </Link>

                            <div className='classy-navbar-toggler'>
                                <span className='navbarToggler'><span /><span /><span /></span>
                            </div>

                            <div className='classy-menu'>
                                <div className='classycloseIcon'>
                                    <div className='cross-wrap'><span className='top' /><span className='bottom' /></div>
                                </div>
                                <div className='classynav'>
                                    <ul>{menus}</ul>
                                    <div className='register-login-area'>
                                        {user && user._id ? [
                                            <a key={0} href='/user' className='text-primary' style={{ textTransform: 'capitalize', fontWeight: 'normal' }}>User</a>,
                                            <a key={1} href='#' className='text-danger' onClick={this.logout}><i className='fa fa-power-off' /></a>
                                        ] : <a href='#' onClick={this.props.showLoginModal}><i className='fa fa-user' /></a>}
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
                <SectionLastNew></SectionLastNew>
            </header>
        )
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { logout };
export default connect(mapStateToProps, mapActionsToProps)(HomeMenu);
