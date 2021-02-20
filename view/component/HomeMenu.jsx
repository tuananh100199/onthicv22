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
                this.setState({ link: window.location.pathname })
            } else {
                setTimeout(done, 100);
            }
        };
        $(document).ready(() => {
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
            done()
        });
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
                            <li key={index}>
                                {isExternalLink ? <a href={link} target='_blank'>{title}</a> : (item.link ?
                                    <Link className={currentLink == item.link || item.submenus.some(item => item.link == currentLink) ? 'text-primary' : ''} to={link} onClick={() => this.onMenuClick(link)}>{title}</Link> :
                                    <a href='#' onClick={e => e.preventDefault()}>{title}</a>)}
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
                        <li key={index}>
                            {isExternalLink ? <a href={link} target='_blank'>{title}</a> :
                                (link.startsWith('#') ? <a href={link}>{item.title}</a> : <Link className={currentLink == link ? 'text-primary' : ''} to={link} onClick={() => this.onMenuClick(link)}>{title}  </Link>)}
                        </li>;
                }
            });
        }

        const { logo, user } = this.props.system ? this.props.system : {};
        return (
            <nav className='navbar navbar-expand-lg navbar-dark ftco_navbar ftco-navbar-light' id='ftco-navbar'>
                <div className='clever-main-menu' style={{ width: '100%' }}>
                    <div className='classy-nav-container breakpoint-off'>
                        <nav className='classy-navbar justify-content-between' ref={this.nav} id='cleverNav'>
                            <Link className='navbar-brand d-sm-flex' to='/'>
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
                                    <ul style={{ marginBottom: 0 }}>{menus}</ul>
                                    {user && user._id ? <div className='btn-group'>
                                        <a href='/user' className='btn btn-primary' style={{ textTransform: 'capitalize', fontWeight: 'normal' }}>User</a>
                                        <a href='#' className='btn btn-danger text-white' onClick={this.logout}><i className='icon icon-power-off' /></a>
                                    </div> : <a href='#' className='btn btn-primary' onClick={this.props.showLoginModal}><i className='icon icon-user' /></a>}
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
            </nav>
        )
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { logout };
export default connect(mapStateToProps, mapActionsToProps)(HomeMenu);
