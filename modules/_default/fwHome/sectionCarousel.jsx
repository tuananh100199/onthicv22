import React from 'react';
import { connect } from 'react-redux';
import { homeGetCarousel } from './redux/reduxCarousel';

// const inComing = ['bounceIn', 'bounceInDown', 'bounceInLeft', 'bounceInRight', 'bounceInUp', 'fadeIn', 'fadeInDownBig', 'fadeInLeft', 'fadeInUp', 'fadeInUpBig', 'rotateIn', 'rotateInDownLeft', 'rotateInDownRight', 'rotateInUpLeft', 'rotateInUpRightIn', 'fadeInLeftBig', 'fadeInRight', 'fadeInRightBig'];
const inComing = ['fadeIn'];
// const outGoing = ['bounceOut', 'bounceOutDown', 'bounceOutLeft', 'bounceOutRight', 'bounceOutUp', 'fadeOut', 'fadeOutDown', 'fadeOutDownBig', 'fadeOutLeft', 'fadeOutLeftBig', 'fadeOutRight', 'fadeOutRightBig', 'fadeOutUp', 'fadeOutUpBig', 'rotateOutDownLeft', 'rotateOutDownRight', 'rotateOutUpLeft', 'rotateOutUpRight', 'flipOutY', 'rotateOut', 'slideOutDown'];
const outGoing = ['fadeOut'];

class SectionCarousel extends React.Component {
    state = {};

    handleResize = () => {
        const viewportWidth = $(window).width();
        let viewportHeight = $(window).height();
        if (viewportWidth <= 576) { // Small
            viewportHeight *= 0.45;
        }
        if (viewportWidth <= 768) { // Medium
            viewportHeight *= 0.65;
        }
        if (viewportWidth <= 992) { //Large
            viewportHeight *= 0.8;
        }
        $('.slider-content').css('height', viewportHeight);
    }

    componentDidMount() {
        $(document).ready(() => {
            const single_id = 'carousel_' + this.props.viewId;
            //const logo_id = 'logo_carousel_' + this.props.viewId;
            this.props.homeGetCarousel(this.props.viewId, carousel => {
                this.setState(carousel, () => {
                    let singleCarousel = $('#' + single_id);
                    // let singleCarousel = $('#' + single_id) = $('#' + logo_id); TODO: Nguyên mẫu
                    const getRandomAnimationEntrance = () => inComing[Math.floor(Math.random() * inComing.length)];
                    const getRandomAnimationExit = () => outGoing[Math.floor(Math.random() * outGoing.length)];
                    this.handleResize();
                    window.addEventListener('resize', this.handleResize);
                    if (this.state.single) {
                        singleCarousel.owlCarousel({
                            items: 1,
                            animateOut: getRandomAnimationEntrance(),
                            animateIn: getRandomAnimationExit(),
                            loop: true,
                            margin: 0,
                            center: true,
                            // nav: true,
                            // navText: ['<i className='carousel-control-prev-icon'></i>', '<i className='carousel-control-next-icon'></i>'],
                            // navContainer: '.nav-container',
                            // navSpeed: 1500,
                            dots: true,
                            dotsClass: 'home_slider_dots d-flex flex-row align-items-center justify-content-start',
                            dotClass: 'home_slider_custom_dot trans_200',
                            autoplay: true,
                            autoplayTimeout: 4000,
                            autoplaySpeed: 1500,
                            autoplayHoverPause: true,
                            responsiveClass: true,
                            onChange: () => {
                                let settings = singleCarousel.data('owl.carousel');
                                if (settings) {
                                    settings.settings.animateIn = getRandomAnimationEntrance();
                                    settings.settings.animateOut = getRandomAnimationExit();
                                }
                            }
                        });
                    }
                    $(window).trigger('resize');
                });
            });
        });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    render() {
        let elements = null;

        if (this.state.items) {
            elements = this.state.items.map((item, index) => {
                return (
                    this.state.single ?
                        <div key={index} className='slider-content'
                            style={{
                                background: `url('${item.image}')`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                backgroundSize: 'cover'
                            }}
                        >
                            <div className='home_container'>
                                <div className='container'>
                                    <div className='row'>
                                        <div className='col'>
                                            <div className='home_content'>
                                                <div className='home_text_content'>
                                                    <div className='home_subtitle'>{item.subtitle}</div>
                                                    <div className='home_title' style={{ whiteSpace: 'nowrap' }}>{item.title}</div>
                                                    <div className='home_text'>
                                                        <p>{item.description}</p>
                                                    </div>
                                                </div>
                                                <div className='home_buttons d-flex flex-row align-items-center justify-content-start'>
                                                    <div className='button button_4 trans_200'><a href={item.link}>Xem thêm</a></div>
                                                    {/* <div className='button button_2 trans_200'><a href='#'>Make an appointment</a></div> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        :
                        <div key={index}
                            style={{ width: '100%', height: '600px' }}>
                            <div style={{
                                overflow: 'hidden',
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: 0,
                                bottom: 0,
                                backgroundImage: 'url(' + item.image + ')',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                backgroundSize: 'cover'
                            }}>
                                <div className='home_container'>
                                    <div className='container'>
                                        <div className='row'>
                                            <div className='col'>
                                                <div className='home_content'>
                                                    <div className='home_text_content'>
                                                        <div className='home_subtitle'>{item.subtitle}</div>
                                                        <div className='home_title'>{item.title}</div>
                                                        <div className='home_text'>
                                                            <p>{item.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className='home_buttons d-flex flex-row align-items-center justify-content-start'>
                                                        <div className='button button_1 trans_200'><a href={item.link}>Read more</a></div>
                                                        {/* <div className='button button_2 trans_200'><a href='#'>Make an appointment</a></div> */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                );
            });
        }

        return this.state.single ?
            <div className='home_slider_container' style={{ position: 'relative' }}>
                <div id={'carousel_' + this.props.viewId} className='owl-carousel owl-theme home_slider'>
                    {elements}
                </div>
                <div className='nav-container' />
            </div>
            :
            <div className='row'>
                <div className='follow-us-instagram' style={{ width: '100%', overflow: 'hidden' }}>
                    <div className='instagram-content d-flex flex-wrap align-items-center owl-carousel '
                        id={'logo_carousel_' + this.props.viewId}>
                        {elements}
                    </div>
                </div>
            </div>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { homeGetCarousel };
export default connect(mapStateToProps, mapActionsToProps)(SectionCarousel);
