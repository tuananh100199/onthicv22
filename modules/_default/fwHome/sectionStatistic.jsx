import React from 'react';
import { connect } from 'react-redux';
import { homeGetStatistic } from './redux/reduxStatistic';

class SectionStatistic extends React.Component {
    state = {};
    componentDidMount() {
        if (this.props.viewId) {
            this.props.homeGetStatistic(this.props.viewId, statistic => this.setState(statistic));
        }
    }

    render() {
        const { title, titleVisible, description, background, items = [] } = this.state;
        const itemLength = items ? items.length : 0,
            itemClassName = 'col-md-' + Math.round(12 / itemLength) + ' d-flex justify-content-center counter-wrap ftco-animate';
        return itemLength ? (
            <section className='ftco-section ftco-counter section-counter-class' style={{ backgroundImage: 'url(\'' + background + '\')' }}>
                <div className=' heading-section heading-section-white ftco-animate'>
                    {titleVisible ? <h2 className='text'>{title}</h2> : null}
                    {description ? <span className='subheading text' dangerouslySetInnerHTML={{ __html: description }} /> : null}
                </div>
                <div className='row justify-content-center'>
                    {items.map((item, index) => (
                        <div key={index} className={itemClassName} >
                            <div className='text-center milestone'>
                                <div className='milestone_counter'>{item.number}</div>
                                <div className='milestone_text'>{item.title}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>) : '';
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { homeGetStatistic };
export default connect(mapStateToProps, mapActionsToProps)(SectionStatistic);