import React from 'react';
import { connect } from 'react-redux';
import { logout } from '../../module/_init/reduxSystem.jsx';
import { Link } from 'react-router-dom';

class HomeMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = { link: '' };
        this.nav = React.createRef();
    }

    componentDidMount() {
    
        const done = () => {
            if ($.fn.classyNav && this.nav.current != null && $(this.nav.current).length > 0 && this.props.system && this.props.system.menus) {
                $(this.nav.current).classyNav();
                $('.clever-main-menu').sticky({ topSpacing: 0 });
                $(window).scroll(function(){
                    let $w = $(this),
                        st = $w.scrollTop(),
                        navbar = $('.ftco_navbar'),
                        sd = $('.js-scroll-wrap');
        
                    if (st > 150) {
                        if ( !navbar.hasClass('scrolled') ) {
                            navbar.addClass('scrolled');
                        }
                    }
                    if (st < 150) {
                        if ( navbar.hasClass('scrolled') ) {
                            navbar.removeClass('scrolled sleep');
                        }
                    }
                    if ( st > 350 ) {
                        if ( !navbar.hasClass('awake') ) {
                            navbar.addClass('awake');
                        }
            
                        if(sd.length > 0) {
                            sd.addClass('sleep');
                        }
                    }
                    if ( st < 350 ) {
                        if ( navbar.hasClass('awake') ) {
                            navbar.removeClass('awake');
                            navbar.addClass('sleep');
                        }
                        if(sd.length > 0) {
                            sd.removeClass('sleep');
                        }
                    }
                });
                
                this.setState({ link: window.location.pathname })
            } else {
                setTimeout(done, 100);
            }
        };
        $(document).ready(done);
    }
    
    onMenuClick = (link) => {
        this.setState({ link })
        $('.classy-navbar-toggler').click()
    };

    logout = (e) => {
        e.preventDefault();
        if (this.props.system && this.props.system.user) {
            this.props.logout();
        }
    };

    render() {
        const currentLink = this.state.link || '/';
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
                        <li key={index} className={'nav-item ' + (currentLink == item.link || item.submenus.some(item => item.link == currentLink) ? 'active' : '')}>
                            {isExternalLink ? <a href={link} className='nav-link' target='_blank'>{title}</a> : (item.link ?
                                <Link className='nav-link' to={link} onClick={() => this.onMenuClick(link)}>{title}</Link> :
                                <a href='#' className='nav-link' onClick={e => e.preventDefault()}>{title}</a>)}
                            <ul className='dropdown'>{
                                item.submenus.map((subMenu, subIndex) => {
                                    const link = subMenu.link ? subMenu.link.toLowerCase().trim() : '/';
                                    if (subMenu.title == '-') {
                                        return <li key={subIndex}>---</li>;
                                    } else {
                                        return isExternalLink ?
                                            <a key={subIndex} href={link}>{T.language.parse(subMenu.title)}</a> :
                                            <Link key={subIndex} to={link} className={currentLink == link ? 'text-primary' : ''} onClick={() => this.onMenuClick(link)}>{T.language.parse(subMenu.title)}</Link>
                                    }
                                })}
                            </ul>
                        </li>
                    ) :
                        <li key={index} className={'nav-item ' + (currentLink == link ? 'active' : '')}>
                            {isExternalLink ? <a href={link} className='nav-link' target='_blank'>{title}</a> :
                                (link.startsWith('#') ? <a href={link} className='nav-link'>{item.title}</a> : <Link className='nav-link' to={link} onClick={() => this.onMenuClick(link)}>{title}  </Link>)}
                        </li>;
                }
            });
        }

        const { logo, user } = this.props.system ? this.props.system : {};
        return (
            <nav className='navbar navbar-expand-lg navbar-dark ftco_navbar bg-dark ftco-navbar-light' id='ftco-navbar'>
                <div className='container'>
                    <a className='navbar-brand' href='index.html'>
                        <i className='flaticon-pharmacy'/><span>Re</span>Medic
                    </a>
                    <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#ftco-nav' aria-controls='ftco-nav' aria-expanded='false' aria-label='Toggle navigation'>
                        <span className='oi oi-menu'/> Menu
                    </button>
        
                    <div className='collapse navbar-collapse' id='ftco-nav'>
                        <div className='classynav'>
                            <ul className='navbar-nav ml-auto'>{menus}</ul>
                            {/*<div className='register-login-area'>*/}
                            {/*    {user && user._id ? [*/}
                            {/*        <a key={0} href='/user' className='text-primary' style={{ textTransform: 'capitalize', fontWeight: 'normal' }}>User</a>,*/}
                            {/*        <a key={1} href='#' className='text-danger' onClick={this.logout}><i className='fa fa-power-off' /></a>*/}
                            {/*    ] : <a href='#' onClick={this.props.showLoginModal}><i className='fa fa-user' /></a>}*/}
                            {/*</div>*/}
                        </div>
                        {/*<ul className='navbar-nav ml-auto'>*/}
                            {/*{menus}*/}
                            {/*<li className='nav-item active'><a href='index.html' className='nav-link'>Home</a></li>*/}
                            {/*<li className='nav-item'><a href='about.html' className='nav-link'>About</a></li>*/}
                            {/*<li className='nav-item'><a href='departments.html' className='nav-link'>Departments</a>*/}
                            {/*</li>*/}
                            {/*<li className='nav-item'><a href='doctor.html' className='nav-link'>Doctors</a></li>*/}
                            {/*<li className='nav-item'><a href='blog.html' className='nav-link'>Blog</a></li>*/}
                            {/*<li className='nav-item'><a href='contact.html' className='nav-link'>Contact</a></li>*/}
                            {/*<li className='nav-item cta'><a href='contact.html' className='nav-link'*/}
                            {/*                                data-toggle='modal'*/}
                            {/*                                data-target='#modalAppointment'><span>Make an Appointment</span></a>*/}
                            {/*</li>*/}
                        {/*</ul>*/}
                    </div>
                </div>
                
                
                
                
                
                
                
                {/*<div className='clever-main-menu'>*/}
                {/*    <div className='classy-nav-container breakpoint-off'>*/}
                {/*        <nav className='classy-navbar justify-content-between' ref={this.nav} id='cleverNav'>*/}
                {/*            <Link className='navbar-brand d-sm-flex' to='/'>*/}
                {/*                {logo ? <img src={logo} style={{ height: '36px', width: 'auto' }} alt='logo' /> : ''}&nbsp;*/}
                {/*                <h4>Trung tâm đào tạo lái xe Hiệp Phát</h4>*/}
                {/*            </Link>*/}
                
                {/*            <div className='classy-navbar-toggler'>*/}
                {/*                <span className='navbarToggler'><span /><span /><span /></span>*/}
                {/*            </div>*/}
                
                {/*            <div className='classy-menu'>*/}
                {/*                <div className='classycloseIcon'>*/}
                {/*                    <div className='cross-wrap'><span className='top' /><span className='bottom' /></div>*/}
                {/*                </div>*/}
                {/*                <div className='classynav'>*/}
                {/*                    <ul>{menus}</ul>*/}
                {/*                    <div className='register-login-area'>*/}
                {/*                        {user && user._id ? [*/}
                {/*                            <a key={0} href='/user' className='text-primary' style={{ textTransform: 'capitalize', fontWeight: 'normal' }}>User</a>,*/}
                {/*                            <a key={1} href='#' className='text-danger' onClick={this.logout}><i className='fa fa-power-off' /></a>*/}
                {/*                        ] : <a href='#' onClick={this.props.showLoginModal}><i className='fa fa-user' /></a>}*/}
                {/*                    </div>*/}
                {/*                </div>*/}
                {/*            </div>*/}
                {/*        </nav>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </nav>
        )
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { logout };
export default connect(mapStateToProps, mapActionsToProps)(HomeMenu);
