import React from 'react';
import { connect } from 'react-redux';
import { getTestimonyByUser } from './redux/reduxTestimony';

class SectionTestimony extends React.Component {
    state = {};

    componentDidMount() {
        if (this.props.testimonyId) {
            this.props.getTestimonyByUser(this.props.testimonyId, testimony => testimony && this.setState({ testimony }));
        }
    }

    componentDidUpdate() {
        setTimeout(() => {
            $('.carousel-testimony').owlCarousel({
                items: 3,
                margin: 0,
                loop: true,
                nav: false,
                navText: [`<i class='fa fa-angle-left'/>`, `<i class='fa fa-angle-right'/>`],
                dots: true,
                autoplay: true,
                autoplayTimeout: 6000,
                smartSpeed: 1000,
                center: true,
                responsive: { 0: { items: 1 }, 576: { items: 2 }, 992: { items: 3 } }
            });

            var i = 0;
            $('.ftco-animate').waypoint(function (direction) {
                if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {
                    i++;
                    $(this.element).addClass('item-animate');
                    setTimeout(function () {
                        $('body .ftco-animate.item-animate').each(function (k) {
                            const el = $(this);
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
        return this.state.testimony && this.state.testimony.items.length > 0 ? (
            <section className='ftco-section testimony-section' style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                <div className='container'>
                    <div className='row justify-content-center'>
                        <div className='col-md-7 heading-section ftco-animate text-center'>
                            <h2 className='mb-4'>{this.state.testimony.title}</h2>
                        </div>
                    </div>
                </div>

                <div className='row'>
                    <div className='container ftco-animate'>
                        <div className='carousel-testimony owl-carousel'>
                            {this.state.testimony.items.map((item, index) => (
                                <div className='item m-1' key={index}>
                                    <div className='testimony-wrap text-center'>
                                        <div className='user-img mb-3' style={{ backgroundImage: 'url(\'' + item.image + '\')' }}>
                                            <span className='quote d-flex align-items-center justify-content-center'>
                                                <i className='icon-quote-left' />
                                            </span>
                                        </div>
                                        <div className='text'>
                                            <p className='' dangerouslySetInnerHTML={{ __html: item.content }} />
                                            <p className='name'>{item.fullname}</p>
                                            <span className='position'>{item.jobPosition}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>) : '';
    }
}

const mapStateToProps = state => ({ testimony: state.testimony });
const mapActionsToProps = { getTestimonyByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionTestimony);