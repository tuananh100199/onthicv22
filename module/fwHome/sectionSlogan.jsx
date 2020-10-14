import React from 'react';
import { connect } from 'react-redux';
import { getSloganByUser } from './redux/reduxSlogan.jsx';

class SectionSlogan extends React.Component {
    state = {};

    componentDidMount() {
        if (this.props.sloganId) {
            this.props.getSloganByUser(this.props.sloganId, slogan => slogan && this.setState({ slogan }));
        }
    }

    componentDidUpdate() {
        setTimeout(T.ftcoAnimate, 250);
    }

    renderItem(item) {
        return (
            <div className='media block-6 services d-block text-center'>
                <img src={item.image} style={{ width: '40%', height: 'auto' }} />
                <div className='media-body p-2 mt-2'>
                    <h3 className='heading mb-3'>{T.language.parse(item.title)}</h3>
                    <p dangerouslySetInnerHTML={{ __html: T.language.parse(item.content) }} />
                </div>
            </div>
        );
    }

    render() {
        return (
            <section className='services-section'>
                <div className='row d-flex justify-content-center'>
                    {this.state.slogan ?
                        this.state.slogan.items.map((item, i) =>
                            <div key={i} className='col-12 col-sm-6 col-md-4 col-lg-3 ftco-animate'>
                                <div className='media block-6 services d-block text-center'>
                                    <img src={item.image} style={{ width: '40%', height: 'auto' }} />
                                    <div className='media-body p-2 mt-2'>
                                        <h3 className='heading mb-3'>{T.language.parse(item.title)}</h3>
                                        <p dangerouslySetInnerHTML={{ __html: T.language.parse(item.content) }} />
                                    </div>
                                </div>
                            </div>
                        ) : ''}
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ slogan: state.slogan });
const mapActionsToProps = { getSloganByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionSlogan);