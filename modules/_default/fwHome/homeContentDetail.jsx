import React from 'react';
import { connect } from 'react-redux';
import { getContentByUser } from './redux/reduxContent';
import NewsFeed from 'view/component/NewsFeed';

class ContentDetail extends React.Component {
    state = { _id: null, title: '', active: false, content: '' };

    componentDidMount() {
        const route = T.routeMatcher('/content/item/:contentId'),
            params = route.parse(window.location.pathname);
        this.setState({ _id: params.contentId });
        this.props.getContentByUser(params.contentId, data => {
            if (data.item) {
                this.setState(data.item, T.ftcoAnimate);
            }
        });
    }

    componentDidUpdate(prevProps) {
        setTimeout(() => {
            T.ftcoAnimate();
            $('html, body').stop().animate({ scrollTop: 0 }, 500, 'swing');
        }, 250);
        if (prevProps.location.pathname != window.location.pathname) {
            let url = window.location.pathname,
                params = T.routeMatcher('/content/item/:contentId').parse(url);
            this.setState({ _id: params.contentId });
            this.props.getContent(params.contentId, data => data.item && this.setState(data.item));
        }
    }

    render() {
        const item = this.state ? this.state : null;
        if (!item) {
            return <p>...</p>;
        } else {
            return (
                <div className='contact' style={{ marginTop: '50px' }}>
                    <div className='container'>
                        <div className='contact_content'>
                            <div className='contact_content_title ftco-animate'>{item.title}</div>
                            <div className='contact_info ftco-animate'>
                                <p dangerouslySetInnerHTML={{ __html: item.content }} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

const mapStateToProps = state => ({ content: state.content });
const mapActionsToProps = { getContentByUser };
export default connect(mapStateToProps, mapActionsToProps)(ContentDetail);