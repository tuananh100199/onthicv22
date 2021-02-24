import React from 'react';
import { connect } from 'react-redux';
import { getStatisticByUser } from './redux/reduxStatistic.jsx';

class SectionSubscribe extends React.Component {
    state = {};

    componentDidMount() {
        if (this.props.statisticId) {
            this.props.getStatisticByUser(this.props.statisticId, statistic => this.setState({ statistic }));
        }
    }

    // componentDidUpdate() {
    //     setTimeout(() => {
    //         $('.section-counter-class').waypoint(function (direction) {
    //             if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {
    //                 const comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',')
    //                 $('.number').each(function () {
    //                     const $this = $(this);
    //                     $this.animateNumber({ number: $this.data('number'), numberStep: comma_separator_number_step }, 7000);
    //                 });
    //             }
    //         }, { offset: '95%' });
    //         T.ftcoAnimate();
    //     }, 250);
    // }

    render() {

        return (
            <section className='ftco-section ftco-counter section-counter-class img' style={{ backgroundImage: 'url(\'' + '' + '\')' }}>
                <div className='container-fluid'>
                    <div className='row justify-content-center mb-5 pb-3'>
                        <div className='col-md-7 text-center heading-section heading-section-white ftco-animate'>
                            <h2 className='mb-4 text'>Subscribe to our newsletter</h2>
                            {/* <span className='subheading text' dangerouslySetInnerHTML={{ __html: T.language.parse(this.state.statistic.description) }} /> */}
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col-md-10'>
                            <div className='row justify-content-center'>
                                <div className="col-lg-8 offset-lg-2">
                                    <div className="newsletter_form_container">
                                        <form action="#" id="newsleter_form" className="newsletter_form">
                                            <input type="text" className="newsletter_input" placeholder="Your E-mail" required="required" />
                                            <button className="newsletter_button">subscribe</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ statistic: state.statistic });
const mapActionsToProps = { getStatisticByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionSubscribe);