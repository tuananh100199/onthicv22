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
                this.setState({ link: window.location.pathname }, () => {
                    $(this.nav.current).classyNav();
                })
            } else {
                setTimeout(done, 100);
            }
        };
        $(document).ready(() => {
            let header = $('.header');
            function setHeader() {
                if($(window).scrollTop() > 91) {
                    header.addClass('scrolled');
                } else {
                    header.removeClass('scrolled');
                }
            }
    
            function initMenu() {
                let hamb = $('.hamburger');
                let menu = $('.menu');
                let menuOverlay = $('.menu_overlay');
                let menuClose = $('.menu_close_container');
        
                hamb.on('click', () => {
                    menu.toggleClass('active');
                    menuOverlay.toggleClass('active');
                });
        
                menuOverlay.on('click', () => {
                    menuOverlay.toggleClass('active');
                    menu.toggleClass('active');
                });
        
                menuClose.on('click', () => {
                    menuOverlay.toggleClass('active');
                    menu.toggleClass('active');
                });
            }
            
            setHeader();
            initMenu();
            $(window).on('resize', () => {
                setHeader();
                setTimeout(() => {
                    $(window).trigger('resize.px.parallax');
                }, 375);
            });
            
            $(document).on('scroll', () => {
                setHeader();
            });
            
            done()
        });
    }
    
    onMenuClick = (link) => {
        this.setState({ link }, () => {
            $(this.nav.current).classyNav();
        })
        $('.hamburger').css('display') == 'block' && $('.menu_close').click();
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
                            <li key={index} className={currentLink == item.link || item.submenus.some(item => item.link == currentLink) ? 'active' : ''}>
                                {isExternalLink ? <a href={link} target='_blank'>{title}</a> : (item.link ?
                                    <Link to={link} onClick={() => this.onMenuClick(link)}>{title}</Link> :
                                    <a href='#' onClick={e => e.preventDefault()}>{title}</a>)}
                                <ul className='dropdown'>{
                                    item.submenus.map((subMenu, subIndex) => {
                                        const link = subMenu.link ? subMenu.link.toLowerCase().trim() : '/';
                                        if (subMenu.title == '-') {
                                            return <li key={subIndex}>---</li>;
                                        } else {
                                            return isExternalLink ?
                                                <li key={subIndex}><a href={link}>{T.language.parse(subMenu.title)}</a></li> :
                                                <li key={subIndex} className={currentLink == link ? 'active' : ''}><Link to={link} onClick={() => this.onMenuClick(link)}>{T.language.parse(subMenu.title)}</Link></li>
                                        }
                                    })}
                                </ul>
                            </li>
                        ) :
                        <li key={index} className={currentLink == link ? 'active' : ''}>
                            {isExternalLink ? <a href={link} target='_blank'>{title}</a> :
                                (link.startsWith('#') ? <a href={link}>{item.title}</a> : <Link to={link} onClick={() => this.onMenuClick(link)}>{title}  </Link>)}
                        </li>;
                }
            });
        }
        
        let { logo, user, facebook, youtube, twitter, instagram, mobile } = this.props.system ? this.props.system : { };
        facebook = facebook ? <li><a href={facebook} target='_blank'><i className='fa fa-facebook' aria-hidden='true'/></a></li> : '';
        youtube = youtube ? <li><a href={youtube} target='_blank'><i className='fa fa-youtube' aria-hidden='true'/></a></li> : '';
        twitter = twitter ? <li><a href={twitter} target='_blank'><i className='fa fa-twitter' aria-hidden='true'/></a></li> : '';
        instagram = instagram ? <li><a href={instagram} target='_blank'><i className='fa fa-instagram' aria-hidden='true'/></a></li> : '';
    
        // facebook = facebook ? <li style={{ marginTop: '12px' }}><a href={facebook} target='_blank'><i className='fa fa-facebook' aria-hidden='true'/></a></li> : '';
        // youtube = youtube ? <li style={{ marginTop: '12px' }}><a href={youtube} target='_blank'><i className='fa fa-youtube' aria-hidden='true'/></a></li> : '';
        // twitter = twitter ? <li style={{ marginTop: '12px' }}><a href={twitter} target='_blank'><i className='fa fa-twitter' aria-hidden='true'/></a></li> : '';
        // instagram = instagram ? <li style={{ marginTop: '12px' }}><a href={instagram} target='_blank'><i className='fa fa-instagram' aria-hidden='true'/></a></li> : '';
        return [
            <header key={0} className='header trans_400'>
                <div className='header_content d-flex flex-row align-items-center jusity-content-start trans_400 classy-nav-container breakpoint-off'>
                    <div className='logo'>
                        <Link to='/' onClick={() => {
                            this.setState({ link: '/' }, () => {
                                $(this.nav.current).classyNav();
                            })
                        }}>
                            <img src={logo} alt={logo} style={{ height: '65px', width: 'auto' }}/>
                            {/*<div style={{ whiteSpace: 'nowrap' }}>Hiệp Phát</div>*/}
                        </Link>
                    </div>
                    <nav className='classy-navbar justify-content-between' ref={this.nav}>
                        <div className='classy-menu'>
                            <nav className='main_nav classynav'>
                                <ul className='d-flex flex-row align-items-center justify-content-start'>
                                    {menus}
                                </ul>
                            </nav>
                        </div>
                    </nav>
                    <div className='header_extra d-flex flex-row align-items-center justify-content-end ml-auto'>
                        <div className='social header_social'>
                            <ul className='d-flex flex-row align-items-center justify-content-start'>
                                {user && user._id ? <div className='btn-group'>
                                    <div className='button button_2 mr-1'><a href='/user'>USER</a></div>
                                    <div className='button button_1 mr-1'><a href='#' onClick={this.logout}><i className='fa fa-power-off' /></a></div>
                                </div> : <div className='button button_2 mr-1'><a href='#' onClick={this.props.showLoginModal}>Đăng nhập</a></div>}
                                {/*{twitter}*/}
                                {/*{facebook}*/}
                                {/*{youtube}*/}
                                {/*{instagram}*/}
                                <div className='hotline' style={{ marginLeft: '5px', fontSize: '15px' }}>
                                    <i className='fa fa-phone'/> {mobile}
                                </div>
                            </ul>
                        </div>
                        <div className='hamburger'><i className='fa fa-bars' aria-hidden='true'/></div>
                    </div>
                </div>
            </header>,
            <div key={1} className='menu_overlay trans_400'/>,
            <div key={2} className='menu trans_400'>
                <div className='menu_close_container'>
                    <div className='menu_close'>
                        <div/>
                        <div/>
                    </div>
                </div>
                <nav className='menu_nav'>
                    <ul>
                        {menus}
                    </ul>
                    {user && user._id ? <div className='btn-group mt-4'>
                        <div className='button button_4 mr-1'><a href='/user'>USER</a></div>
                        <div className='button button_1 mr-1'><a href='#' onClick={this.logout}><i className='fa fa-power-off' /></a></div>
                    </div> : <div className='button button_4 mr-1 text-center'><a href='#' onClick={this.props.showLoginModal}>Đăng nhập</a></div>}
                </nav>
                <div className='menu_extra'>
                    <div className='menu_link'>Hotline liên hệ: {mobile}</div>
                </div>
                <div className='social menu_social'>
                    <ul className='d-flex flex-row align-items-center justify-content-start'>
                        {twitter}
                        {facebook}
                        {youtube}
                        {instagram}
                    </ul>
                </div>
            </div>
        ]
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { logout };
export default connect(mapStateToProps, mapActionsToProps)(HomeMenu);
