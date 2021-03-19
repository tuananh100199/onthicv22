import React from 'react';
import { connect } from 'react-redux';
import { getLogoByUser } from './redux/reduxLogo';

class SectionLogo extends React.Component {
    state = {};

    componentDidMount() {
        if (this.props.logoId) {
            this.props.getLogoByUser(this.props.logoId, logo => this.setState({ logo }));
        }
    }

    componentDidUpdate() {
        $('.destination-slider').owlCarousel({
            autoplay: true,
            loop: true,
            items: 1,
            margin: 30,
            stagePadding: 0,
            nav: true,
            dots: true,
            navText: [`<span class='ion-ios-arrow-back'>`, `<span class='ion-ios-arrow-forward'>`],
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 2
                },
                1000: {
                    items: 4
                }
            }
        });
        setTimeout(() => {
            var i = 0;
            $('.ftco-animate').waypoint(function (direction) {
                if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {
                    i++;
                    $(this.element).addClass('item-animate');
                    setTimeout(function () {

                        $('body .ftco-animate.item-animate').each(function (k) {
                            var el = $(this);
                            setTimeout(function () {
                                var effect = el.data('animate-effect');
                                if (effect === 'fadeIn') {
                                    el.addClass('fadeIn ftco-animated');
                                } else if (effect === 'fadeInLeft') {
                                    el.addClass('fadeInLeft ftco-animated');
                                } else if (effect === 'fadeInRight') {
                                    el.addClass('fadeInRight ftco-animated');
                                } else {
                                    el.addClass('fadeInUp ftco-animated');
                                }
                                el.removeClass('item-animate');
                            }, k * 50, 'easeInOutExpo');
                        });

                    }, 100);

                }

            }, { offset: '95%' });
        }, 250);
    }

    render() {
        const itemLength = this.state.logo ? this.state.logo.items.length : 0;
        return itemLength > 0 ? (
            <section className='ftco-section ftco-destination'>
                <div className='container'>
                    <div className='row justify-content-start pt-3 pb-3'>
                        <div className='col-md-12 heading-section ftco-animate'>
                            <h2 className='mb-4 text-center'><strong>{this.state.logo.title}</strong></h2>
                        </div>
                    </div>

                    <div className='row'>
                        <div className='col-md-12'>
                            <div className='destination-slider owl-carousel ftco-animate'>
                                {this.state.logo.items.map((item, index) => (
                                    <div key={index} className='item'>
                                        <div className='destination'>
                                            <a href={item.link} className='img d-flex justify-content-center align-items-center' target='_blank'
                                                style={{ backgroundImage: `url('${item.image}')` }}>
                                            </a>
                                            <div className='text p-3'>
                                                <h3><a href='#'>{item.name}</a></h3>
                                                <span className='listing'>{item.address}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))};
                            </div>
                        </div>
                    </div>
                </div>
            </section>) : '';
    }
}

const mapStateToProps = state => ({ logo: state.logo });
const mapActionsToProps = { getLogoByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionLogo);