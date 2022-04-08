import React from 'react';
import { connect } from 'react-redux';
import { logout } from 'modules/_default/_init/redux';
import { Link } from 'react-router-dom';
import CandidateModal from 'modules/mdDaoTao/fwCandidate/homeCandidateModal';
class HomeMenu extends React.Component {
    state = { link: '' };

    componentDidMount() {
        const done = () => {
            if ($.fn.classyNav && this.nav && $(this.nav).length > 0 && this.props.system && this.props.system.menus) {
                this.setState({ link: window.location.pathname }, () => $(this.nav).classyNav());
            } else {
                setTimeout(done, 100);
            }
        };
        $(document).ready(() => {
            let header = $('.header');
            header.addClass('scrolled');
            header.addClass('header_video');
            function setHeader() {
                let introVideo = $('#introVideo');
                if(introVideo.height()<=0){
                    if ($(window).scrollTop() > 91) {
                        header.addClass('scrolled');
                    } else {
                        header.removeClass('scrolled');
                    }
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

            // setHeader();
            initMenu();
            $(window).on('resize', () => {
                setHeader();
                setTimeout(() => $(window).trigger('resize.px.parallax'), 375);
            });

            $(document).on('scroll', () =>{
                // setHeader();
                let introVideo = $('#introVideo');
                if(!introVideo.length||introVideo.height()<=0){
                    if ($(window).scrollTop() > 91) {
                        header.addClass('scrolled');
                    } else {
                        header.removeClass('scrolled');
                    }
                }
                let height=0;
                if(introVideo.length){
                    height=window.innerHeight;
                }

                if ($(window).scrollTop() >height- 91) {
                    // header.addClass('scrolled');
                    header.removeClass('header_video');
                } else {
                    header.addClass('header_video');
                    // header.removeClass('scrolled');
                }
                // this.activeMenu();
            } );
            done();
        });
    }

    // activeMenu = ()=>{
    //     const menus = this.props.system && this.props.system.menus ? this.props.system.menus :null;
    //     if(menus){
    //         menus.forEach(menu=>{
    //             const link = menu.link && menu.link!='/' ? menu.link:'';
    //             const item = document.querySelector(link);
    //             console.log(item);
    //         });
    //     }
    // }

    onMenuClick = (link) => {
        if(link==window.location.pathname){
            this.scrollToTop(link);
        }else{
            this.setState({ link }, () => $(this.nav).classyNav());
            $('.hamburger').css('display') == 'block' && $('.menu_close').click();
        }
    }

    logout = (e) => e.preventDefault() || (this.props.system && this.props.system.user && this.props.logout());

    showCandidateModal = (e) => e.preventDefault() || this.candidateModal.show();

    // scroll = (link) => {
    //     document.getElementById(link) && document.getElementById('gioiThieu').scrollIntoView({
    //         block: 'end',
    //         behavior: 'smooth',
    //         inline: 'nearest'
    //     });
    // }

    getMenuHeight = ()=>{
        let height = 75;//large devices;
        const viewportWidth = $(window).width();
        if(viewportWidth<=576) height=60;//small menu
        return height;
    }

    scroll = (event,hash) =>{
        // Make sure this.hash has a value before overriding default behavior
        if (hash !== '') {
            // Prevent default anchor click behavior
            event.preventDefault();
            if(!$(hash).length){
                window.location=`/${hash}`;
            }
            const height = this.getMenuHeight();
            const introVideo = $('#introVideo');
            let Y = window.scrollY;
            const scrollMore = introVideo.length && introVideo.height()-Y>0?introVideo.height()-Y:0;
            // Using jQuery's animate() method to add smooth page scroll
            // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
            this.setState({link:hash});
            $('html, body').animate({
            scrollTop: $(hash).offset().top - height + scrollMore,
            }, 800, ()=>{
            // Add hash (#) to URL when done scrolling (default click behavior)
            // window.location.hash = hash;
            });
            
            
        } // End if
    }

    scrollToTop = (link)=>{
        this.setState({link});
        $('html, body').animate({
            scrollTop: 0
            }, 800, ()=>{
            // Add hash (#) to URL when done scrolling (default click behavior)
            // window.location.hash = hash;
            });
    }

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
                    return (item.active ? (item.submenus && item.submenus.length > 0) ? (
                        <li key={index} className={currentLink == item.link || item.submenus.some(item => item.link == currentLink) ? 'active' : ''}>
                            {isExternalLink ? <a href={link} target='_blank' rel='noreferrer'>{item.title} test 1</a> : 
                                (item.link ?
                                    <Link to={link} onClick={() => this.onMenuClick(link)}>{item.title} test 4</Link> :
                                    <a href='#' onClick={e => e.preventDefault()}>{item.title} test 5</a>
                                )
                            }
                            <ul className='dropdown'>{
                                item.submenus.map((subMenu, subIndex) => {
                                    const link = subMenu.link ? subMenu.link.toLowerCase().trim() : '/';
                                    if (subMenu.title == '-') {
                                        return <li key={subIndex}>---</li>;
                                    } else {
                                        return isExternalLink ?
                                            <li key={subIndex}><a href={link}>{subMenu.title}</a></li> :
                                            <li key={subIndex} className={currentLink == link ? 'active' : ''}><Link to={link} onClick={() => this.onMenuClick(link)}>{subMenu.title}</Link></li>;
                                    }
                                })}
                            </ul>
                        </li>
                    ) : (
                        <li key={index} className={currentLink == link ? 'active' : ''}>
                            {isExternalLink ? <a href={link} target='_blank' rel='noreferrer'>{item.title} test2</a> :
                                (link.startsWith('#') ? <a href={link} onClick={(e) => this.scroll(e,link)}>{item.title}</a> : <Link to={link} onClick={() => this.onMenuClick(link)}>{item.title}  </Link>)}
                        </li>) : null);
                }
            });
        }

        let { logo, user, facebook, youtube, twitter, instagram, mobile } = this.props.system ? this.props.system : { logo: '', user: '', facebook: '', youtube: '', twitter: '', instagram: '', mobile: '', email: '' };
        facebook = facebook ? <li><a href={facebook} target='_blank' rel='noreferrer'><i className='fa fa-facebook' aria-hidden='true' /></a></li> : '';
        youtube = youtube ? <li><a href={youtube} target='_blank' rel='noreferrer'><i className='fa fa-youtube' aria-hidden='true' /></a></li> : '';
        twitter = twitter ? <li><a href={twitter} target='_blank' rel='noreferrer'><i className='fa fa-twitter' aria-hidden='true' /></a></li> : '';
        instagram = instagram ? <li><a href={instagram} target='_blank' rel='noreferrer'><i className='fa fa-instagram' aria-hidden='true' /></a></li> : '';

        return <>
            <header className='header trans_400'>
                <div className='header_content d-flex flex-row align-items-center jusity-content-start trans_400 classy-nav-container breakpoint-off'>
                    {/* Hamburger */}
                    <div className='hamburger'><i className='fa fa-bars' aria-hidden='true' /></div>
                    {/* logo */}
                    <div className='logo' style={{ height: '100%' }}>
                        <Link to='/' onClick={() => this.onMenuClick('/')}>
                            <img src={logo} alt='Logo' style={{ marginTop: '2%', height: '96%', width: 'auto' }} />
                            {/*<div style={{ whiteSpace: 'nowrap' }}>Hiệp Phát</div>*/}
                        </Link>
                    </div>
                    {/* menu horizon */}
                    <nav className='classy-navbar justify-content-between' ref={e => this.nav = e}>
                        <div className='classy-menu'>
                            <nav className='main_nav classynav'>
                                <ul className='d-flex flex-row align-items-center justify-content-start'>{menus}</ul>
                            </nav>
                        </div>
                    </nav>
                    {/* login logout horizon */}
                    <div className='header_extra d-flex flex-row align-items-center justify-content-end ml-auto'>
                        <div className='social'>
                            <ul className='d-flex flex-row align-items-center justify-content-start'>
                                {user && user._id ?
                                    <div className='btn-group'>
                                        <div className='button button_2 mr-1 large_btn'><a href={'tel:' + mobile}><i className='fa fa-phone' /> {mobile}</a></div>
                                        <div className='button button_1 mr-1 large_btn' > <a href='#' onClick={this.showCandidateModal}>Đăng ký tư vấn</a></div>

                                        <div className='btn-group m-auto pl-2 small_btn' >
                                            <li data-toggle='tooltip' title='Số điện thoại'>
                                                <a href={'tel:' + mobile}><i className='fa fa-phone' style={{ color: '#4CA758' }} /></a>
                                            </li>
                                            <li data-toggle='tooltip' title='Đăng ký tư vấn'>
                                                <a href='#' onClick={this.showCandidateModal}><i className='fa fa-envelope-o' style={{ color: 'red' }} aria-hidden='true' /></a>
                                            </li>
                                        </div>
                                        <div className='btn-group m-auto pl-2' >
                                            <li data-toggle='tooltip' title='Trang cá nhân'>
                                                <a href='/user'><i className='fa fa-user-circle-o' style={{ color: '#4CA758' }} aria-hidden='true' /></a>
                                            </li>
                                            <li data-toggle='tooltip' title='Đăng xuất'>
                                                <a href='#' onClick={this.logout}><i className='fa fa-power-off' style={{ color: 'red' }} aria-hidden='true' /></a>
                                            </li>
                                        </div>
                                    </div> :
                                    <div className='btn-group'>
                                        <div className='button button_2 mr-1 large_btn'>
                                            <a href={'tel:' + mobile}><i className='fa fa-phone' /> {mobile}</a>
                                        </div>
                                        <div className='button button_1 mr-1 large_btn'>
                                            <a href='#' onClick={this.showCandidateModal}>Đăng ký tư vấn</a>
                                        </div>
                                        <div className='button button_2 mr-1 large_btn'>
                                            <a href='#' onClick={this.props.showLoginModal}>Đăng nhập</a>
                                        </div>


                                        <div className='btn-group m-auto pl-2 small_btn' >
                                            <li data-toggle='tooltip' title='Số điện thoại'><a href={'tel:' + mobile}><i className='fa fa-phone' style={{ color: '#4CA758' }} /></a></li>
                                            <li data-toggle='tooltip' title='Đăng ký tư vấn'><a href='#' onClick={this.showCandidateModal} ><i className='fa fa-envelope-o' style={{ color: 'red' }} aria-hidden='true'></i></a></li>
                                            <li data-toggle='tooltip' title='Đăng nhập' className='login_css_small' ><a href='#' onClick={this.props.showLoginModal}><i className='fa fa-user-circle-o' style={{ color: '#4CA758' }} /></a></li>
                                        </div>
                                    </div>}
                                {/* {twitter}{facebook}{youtube}{instagram} */}
                            </ul>
                        </div>
                        {/* <div className='hamburger'><i className='fa fa-bars' aria-hidden='true' /></div> */}
                    </div>

                    <div className="search-button"><i className="fa fa-search" aria-hidden="true"></i></div>
                </div>
            </header>
            <div className='menu_overlay trans_400' />
            <div className='menu trans_400'>
                <div className='menu_close_container'>
                    <div className='menu_close'><div /><div /></div>
                </div>
                <nav className='menu_nav'>
                    <ul>{menus}</ul>
                    
                    {/* {user && user._id ? <div className='btn-group mt-4'>
                        <div className='button button_2 mr-1'><a href={'mailto:' + email}>Email</a></div>
                        <div className='button button_1 mr-1'><a href='#' onClick={this.logout}><i className='fa fa-power-off' /> Thoát</a></div>
                    </div> : <div className='button button_4 mr-1 text-center'><a href='#' onClick={this.props.showLoginModal}>Đăng nhập</a></div>} */}
                </nav>
                <div className='menu_extra'>
                    <div className='menu_link'>Hotline liên hệ: {mobile}</div>
                </div>
                <div className='social menu_social'>
                    <ul className='d-flex flex-row align-items-center justify-content-start'>
                        {twitter}{facebook}{youtube}{instagram}
                    </ul>
                </div>
            </div>
            <CandidateModal ref={e => this.candidateModal = e} autoActive={true}/>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { logout };
export default connect(mapStateToProps, mapActionsToProps)(HomeMenu);
