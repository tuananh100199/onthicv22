import React from 'react';
import { connect } from 'react-redux';
import { getStatisticByUser } from './redux/reduxStatistic';

class SectionStatistic extends React.Component {
    state = {};

    componentDidMount() {
        if (this.props.statisticId) {
            this.props.getStatisticByUser(this.props.statisticId, statistic => this.setState({ statistic }));
        }
    }

    componentDidUpdate() {
        setTimeout(() => {
            $('.section-counter-class').waypoint(function (direction) {
                if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {
                    const comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',')
                    $('.number').each(function () {
                        const $this = $(this);
                        $this.animateNumber({ number: $this.data('number'), numberStep: comma_separator_number_step }, 7000);
                    });
                }
            }, { offset: '95%' });
            T.ftcoAnimate();
        }, 250);
    }

    render() {
        const itemLength = this.state.statistic ? this.state.statistic.items.length : 0,
            itemClassName = 'col-md-' + (12 / Math.min(itemLength, 4)) + ' d-flex justify-content-center counter-wrap ftco-animate';
        return itemLength > 0 ? (
            <section className='ftco-section ftco-counter section-counter-class img' style={{ backgroundImage: 'url(\'' + this.state.statistic.background + '\')' }}>
                <div className='container-fluid'>
                    <div className='row justify-content-center mb-5 pb-3'>
                        <div className='col-md-7 text-center heading-section heading-section-white ftco-animate'>
                            <h2 className='mb-4 text'>{T.language.parse(this.state.statistic.title)}</h2>
                            <span className='subheading text' dangerouslySetInnerHTML={{ __html: T.language.parse(this.state.statistic.description) }} />
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col-md-10'>
                            <div className='row justify-content-center'>
                                {this.state.statistic.items.map((item, index) => (
                                    <div key={index} className={itemClassName}>
                                        <div className='block-18 text-center'>
                                            <div className='text'>
                                                <strong className='number' data-number={item.number}>{item.number}</strong>
                                                <span>{T.language.parse(item.title)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>) : '';
    }
}

const mapStateToProps = state => ({ statistic: state.statistic });
const mapActionsToProps = { getStatisticByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionStatistic);