import React from 'react';
import { connect } from 'react-redux';
import { getEventFeed } from '../../module/fwEvent/redux.jsx';
import { Link } from 'react-router-dom';

const texts = {
    vi: {
        recent: 'Có thể bạn quan tâm',
    },
    en: {
        recent: 'You may like',
    }
};

class SectionSideBar extends React.Component {
    componentDidMount() {
        this.props.getEventFeed();
    }
    
    render() {
        const language = T.language(texts);
        let recentEvents = (this.props.event && this.props.event.newsFeed ? this.props.event.newsFeed : []).map((item, index) => {
            const link = item.link ? '/sukien/' + item.link : '/event/item/' + item._id;
            return (
                <div className='single--courses d-flex align-items-center' key={index}>
                    <Link to={link}>
                        <div className='thumb' style={{ overflow: 'hidden' }}>
                            <img src={item.image} alt={T.language.parse(item.title)} />
                        </div>
                    </Link>
                    <div className='content'>
                        <Link to={link}><h5>{T.language.parse(item.title)}</h5></Link>
                    </div>
                </div>)
        });
        
        return (
            <div className='course-sidebar'>
                <div className='sidebar-widget'>
                    <h4>{language.recent}</h4>
                    {recentEvents}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ event: state.event });
const mapActionsToProps = { getEventFeed };
export default connect(mapStateToProps, mapActionsToProps)(SectionSideBar);