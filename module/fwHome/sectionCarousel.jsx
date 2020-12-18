import React from 'react';
import { connect } from 'react-redux';
import { homeGetCarousel } from './redux/reduxCarousel.jsx';

class SectionCarousel extends React.Component {
    state = {};
    
    componentDidMount() {
        $(document).ready(() => {
            const single_id = 'carousel_' + this.props.viewId, logo_id = 'logo_carousel_' + this.props.viewId;
            this.props.homeGetCarousel(this.props.viewId, carousel => {
                this.setState(carousel, () => {
                    let singleCarousel = $('#' + single_id), logoCarousel = $('#' + logo_id);
                    if (this.state.single) {
                        singleCarousel.owlCarousel({
                            items: 1,
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
                        });
                    }
                })
            });
        })
    }
    
    render() {
        let elements = null, height = this.state.height;
        
        if (this.state.items) {
            elements = this.state.items.map((item, index) => {
                return (
                    this.state.single ?
                        <div key={index} className='slider-content'
                             style={{
                                 height, background: `url('${item.image}')`,
                                 backgroundRepeat: 'no-repeat',
                                 backgroundPosition: 'center',
                                 backgroundSize: 'contain'
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
            <div style={{ height, position: 'relative' }}>
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
