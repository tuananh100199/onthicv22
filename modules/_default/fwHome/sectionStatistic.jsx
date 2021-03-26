import React from 'react';
import { connect } from 'react-redux';
import { homeGetStatistic } from './redux/reduxStatistic';
import CountUp from 'view/js/countUp';

class StatisticNumber extends React.Component {
    valueElement = React.createRef();

    componentDidMount() {
        setTimeout(() => {
            const endValue = this.props.value ? parseInt(this.props.value) : 0;
            new CountUp(this.valueElement.current, 0, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
        }, 1000);
    }

    render() {
        return (
            <div className={this.props.itemClassName} >
                <div className='text-center milestone'>
                    <div className='milestone_counter' ref={this.valueElement}></div>
                    <div className='milestone_text'>{this.props.title}</div>
                </div>
            </div>
        )
    }
}
class SectionStatistic extends React.Component {
    state = {};
    componentDidMount() {
        if (this.props.viewId) {
            this.props.homeGetStatistic(this.props.viewId, statistic => this.setState(statistic));
        }
    }

    render() {
        const { title, titleVisible, description, items = [] } = this.state;
        const itemLength = items ? items.length : 0,
            itemClassName = 'col-md-' + Math.round(12 / itemLength) + ' d-flex justify-content-center counter-wrap ftco-animate';
        return itemLength ? (
            <section className='ftco-section ftco-counter section-counter-class pb-5'>
                <div className=' heading-section heading-section-white ftco-animate'>
                    {titleVisible ? <h2 className='text'>{title}</h2> : null}
                    {description ? <span className='subheading text' dangerouslySetInnerHTML={{ __html: description }} /> : null}
                </div>
                <div className='row justify-content-center'>
                    {items.map((item, index) => (
                        <StatisticNumber key={index} value={item.number} title={item.title} itemClassName={itemClassName} />
                    ))}
                </div>
            </section>) : '';
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { homeGetStatistic };
export default connect(mapStateToProps, mapActionsToProps)(SectionStatistic);