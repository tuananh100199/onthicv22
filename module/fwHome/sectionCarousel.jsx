import React from 'react';
import { connect } from 'react-redux';
import { homeGetCarousel } from './redux/reduxCarousel.jsx';

const inComing = ['bounceIn', 'bounceInDown', 'bounceInLeft', 'bounceInRight', 'bounceInUp', 'fadeIn', 'fadeInDownBig', 'fadeInLeft', 'fadeInUp', 'fadeInUpBig', 'rotateIn', 'rotateInDownLeft', 'rotateInDownRight', 'rotateInUpLeft', 'rotateInUpRightIn', 'fadeInLeftBig', 'fadeInRight', 'fadeInRightBig'];
// const inComing = ['slideInRight'];
const outGoing = ['bounceOut', 'bounceOutDown', 'bounceOutLeft', 'bounceOutRight', 'bounceOutUp', 'fadeOut', 'fadeOutDown', 'fadeOutDownBig', 'fadeOutLeft', 'fadeOutLeftBig', 'fadeOutRight', 'fadeOutRightBig', 'fadeOutUp', 'fadeOutUpBig', 'rotateOutDownLeft', 'rotateOutDownRight', 'rotateOutUpLeft', 'rotateOutUpRight', 'flipOutY', 'rotateOut', 'slideOutDown'];
// const outGoing = ['slideOutLeft'];

class SectionCarousel extends React.Component {
    state = {};
    
    handleResize = () => {
        const viewportWidth = $(window).width();
        let viewportHeight = $(window).height();
        if (viewportWidth <= 576) { // Small
            viewportHeight *= 0.45
        }
        if (viewportWidth <= 768) { // Medium
            viewportHeight *= 0.65
        }
        if (viewportWidth <= 992) { //Large
            viewportHeight *= 0.8
        }
        $('.slider-content').css('height', viewportHeight);
    }
    
    componentDidMount() {
        $(document).ready(() => {
            const single_id = 'carousel_' + this.props.viewId, logo_id = 'logo_carousel_' + this.props.viewId;
            this.props.homeGetCarousel(this.props.viewId, carousel => {
                this.setState(carousel, () => {
                    let singleCarousel = $('#' + single_id), logoCarousel = $('#' + logo_id);
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
                            nav: true,
                            navText : ["<i class='fa fa-chevron-left'></i>","<i class='fa fa-chevron-right'></i>"],
                            navContainer: '.nav-container',
                            navSpeed: 1500,
                            dots: false,
                            autoplay: false,
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
                })
            });
        })
    }
    
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }
    
    render() {
        let elements = null, height = this.state.height;
        
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
                            <div className='inner'>
                                <h2>{T.language.parse(item.title)}</h2>
                                {item.link ? <a href={item.link} target='_blank'>Xem thêm</a> : ''}
                            </div>
                        </div>
                        :
                        <div key={index} className='single-instagram center-hide'
                             style={{ maxWidth: '100%', height }}>
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
                                backgroundSize: 'contain'
                            }}>
                            </div>
                            <a href={item.link} target='_blank'>
                                <i className='fa fa-link'/>
                            </a>
                        </div>
                );
            });
        }
        
        return this.state.single ?
            <div style={{ position: 'relative' }}>
                <div id={'carousel_' + this.props.viewId} className='owl-carousel owl-theme'>
                    {elements}
                </div>
                <div className='nav-container'/>
            </div>
            :
            <div className='row'>
                <div className='follow-us-instagram' style={{ width: '100%', overflow: 'hidden' }}>
                    <div className='instagram-content d-flex flex-wrap align-items-center owl-carousel'
                         id={'logo_carousel_' + this.props.viewId}>
                        {elements}
                    </div>
                </div>
            </div>
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { homeGetCarousel };
export default connect(mapStateToProps, mapActionsToProps)(SectionCarousel);
