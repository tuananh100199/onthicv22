import React from 'react';
import { connect } from 'react-redux';
import { homeGetCarousel } from './redux/reduxCarousel.jsx';
import Slider from 'react-animated-slider';
import 'react-animated-slider/build/horizontal.css';

class SectionCarousel extends React.Component {
    state = {};
    
    componentDidMount() {
        this.props.homeGetCarousel(this.props.viewId, carousel => this.setState(carousel));
    }
    
    componentDidUpdate() {
        const single_id = 'carousel_' + this.props.viewId, logo_id = 'logo_carousel_' + this.props.viewId;
        
        const ready = () => {
            let singleCarousel = $('#' + single_id), logoCarousel = $('#' + logo_id);
            if (!this.state.single && logoCarousel.length && $.fn.owlCarousel) {
                logoCarousel.owlCarousel({
                    loop: true,
                    margin: 0,
                    nav: false,
                    autoplay: true,
                    autoplayTimeout: 1500,
                    autoplaySpeed: 500,
                    autoplayHoverPause: true,
                    responsiveClass: true,
                    responsive: {
                        0: { items: 1 }, 375: { items: 3 }, 600: { items: 5 }, 1000: { items: 7 }
                    }
                });
            }
        };
        
        $(document).ready(ready);
    }
    
    render() {
        let elements = null, height = this.state.height;
        
        if (this.state.items) {
            elements = this.state.items.map((item, index) => {
                return (
                    this.state.single ?
                        <div key={index}
                             style={{ background: `url('${item.image}') no-repeat center center` }}
                             className='slider-content'>
                            <div className='inner'>
                                <h2>{T.language.parse(item.title)}</h2>
                                {item.link ? <a href={item.link} target='_blank'>More</a> : ''}
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
                                backgroundPosition: 'center center',
                                backgroundSize: 'auto 100%'
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
            <div style={{ height: height }}>
                <Slider className='slider-wrapper' autoplay={2000} duration={1500} infinite={true}>
                    {elements}
                </Slider>
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
