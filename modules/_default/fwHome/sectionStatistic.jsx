import React from 'react';
import { connect } from 'react-redux';
import { homeGetStatistic } from './redux/reduxStatistic';

class SectionStatistic extends React.Component {
    state = {};

    componentDidMount() {
        if (this.props.viewId) {
            this.props.homeGetStatistic(this.props.viewId, statistic => this.setState({ statistic }));
        }
    }

    render() {
        const itemLength = this.state.statistic ? this.state.statistic.items.length : 0,
            itemClassName = 'col-md-' + Math.round(12 / itemLength) + ' d-flex justify-content-center counter-wrap ftco-animate';
        return itemLength > 0 ? (
            <section className='ftco-section ftco-counter section-counter-class img' style={{ backgroundImage: 'url(\'' + this.state.statistic.background + '\')' }}>
                <div className='container-fluid'>
                    <div className='justify-content-center'>
                        <div className='text-center heading-section heading-section-white ftco-animate'>
                            <h2 className='text'>{this.state.statistic.title}</h2>
                            <span className='subheading text' dangerouslySetInnerHTML={{ __html: this.state.statistic.description }} />
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col-md-10'>
                            <div className='row justify-content-center'>
                                {this.state.statistic.items.map((item, index) => (
                                    <div key={index} className={itemClassName} >
                                        <div className="milestone">
                                            <div className="milestone_counter">{item.number}</div>
                                            <div className="milestone_text">{item.title}</div>
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

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { homeGetStatistic };
export default connect(mapStateToProps, mapActionsToProps)(SectionStatistic);