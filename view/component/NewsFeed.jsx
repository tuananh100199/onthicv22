import React from 'react';
import { connect } from 'react-redux';
import { getEventFeed } from '../../module/fwEvent/redux.jsx';
import { Link } from 'react-router-dom';

class NewsFeed extends React.Component {
    componentDidMount() {
        this.props.getEventFeed(0, T.newsFeedPageSize);
    }

    getLink(type, _id, link) {
        if (type == 'event') {
            return link ? '/sukien/' + link : '/event/item/' + _id;
        }
    }

    renderTab(type, newsFeed) {
        if (newsFeed.length == 0) {
            return <p style={{ padding: '12px' }}>Thông tin đang được cập nhật!</p>;
        } else {
            const item0 = newsFeed[0],
                link = this.getLink(type, item0._id, item0.link),
                rightItems = [];
            for (let i = 1; i <= 3 && i < newsFeed.length; i++) {
                const item = newsFeed[i];
                rightItems.push(
                    <Link to={this.getLink(type, item._id, item.link)} key={i}>
                        <img src={item.image} style={{ width: '33%', height: 'auto', display: 'inline-block', verticalAlign: 'top', padding: '6px 0' }} />
                        <p style={{ width: '66%', margin: 0, display: 'inline-block', verticalAlign: 'top', padding: '12px 0 6px 6px', textAlign: 'justify' }}>{item.title}</p>
                    </Link >
                );
                rightItems.push(<div key={i + 0.5} style={{ clear: 'both' }} />);
            }
            return newsFeed.length == 0 ? '' : (
                <div className='row' style={{ margin: 0 }}>
                    <div className='col-6'>
                        <Link to={link} style={{ textDecoration: 'none' }}>
                            <img src={item0.image} style={{ width: '100%', height: 'auto', padding: '6px 0' }} />
                        </Link>
                        <Link to={link} style={{ textDecoration: 'none' }}>
                            <h4 style={{ color: '#428bca', fontSize: '20px' }}>{item0.title}</h4>
                        </Link>
                        <p>{item0.abstract}</p>
                    </div>
                    <div className='col-6' style={{ padding: '6px 0' }}>
                        {rightItems}
                    </div>
                </div>
            );
        }
    }

    render() {
        const eventComponents = (this.props.event && this.props.event.newsFeed) ?
            this.renderTab('event', this.props.event.newsFeed) : 'Đang cập nhật';

        const borderStyle = '1px solid #dee2e6';
        return (
            <div style={{ marginTop: '12px' }}>
                <ul className='nav nav-tabs' style={{ display: 'flex' }}>
                    <li className='nav-item'>
                        <a className='nav-link' href='#nfdCompanyNews' data-toggle='tab' role='tab' aria-controls='nfdCompanyNews' aria-selected='false'>Bản tin doanh nghiệp</a>
                    </li>
                    <li className='nav-item'>
                        <a className='nav-link' href='#nfdSeminar' data-toggle='tab' role='tab' aria-controls='nfdSeminar' aria-selected='true'>Hội thảo SV & Doanh nghiệp</a>
                    </li>
                    <li className='nav-item'>
                        <a className='nav-link active' href='#nfdNews' data-toggle='tab' role='tab' aria-controls='nfdNews' aria-selected='true'>Tin tức</a>
                    </li>
                </ul>
                <div className='tab-content' style={{ minHeight: '360px', borderLeft: borderStyle, borderRight: borderStyle, borderBottom: borderStyle, borderBottomLeftRadius: '0.25rem', borderBottomRightRadius: '0.25rem' }}>
                    <div className='tab-pane fade' id='nfdSeminar' role='tabpanel'>
                        {eventComponents}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ event: state.event });
const mapActionsToProps = { getEventFeed };
export default connect(mapStateToProps, mapActionsToProps)(NewsFeed);
