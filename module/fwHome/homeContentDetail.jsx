import React from 'react';
import { connect } from 'react-redux';
import { getContent } from './redux/reduxContent.jsx';

class ContentDetail extends React.Component {
    state = { _id: null, title: '', active: false, content: '' };

    componentDidMount() {
        const route = T.routeMatcher('/content/item/:contentId'),
            params = route.parse(window.location.pathname);
        this.setState({ _id: params.contentId });
        this.props.getContent(params.contentId, data => {
            if (data.item) {
                this.setState(data.item);
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
            this.props.getContent(params.contentId, data => {
                if (data.item) {
                    this.setState(data.item);
                }
            });
        }
    }

    render() {
        const item = this.state ? this.state : null;
        if (!item) {
            return <p>...</p>;
        } else {
            return (
                <section>
                    <div className='container'>
                        <div className='course--content wow fadeInUp' data-wow-delay='250ms' >
                            <div className='clever-description p-2'>
                                <div className='about-course mb-30'>
                                    <h3 className='text-primary text-center'>{item.title}</h3>
                                    <p dangerouslySetInnerHTML={{ __html: item.content }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            );
        }
    }
}

const mapStateToProps = state => ({ content: state.content });
const mapActionsToProps = { getContent };
export default connect(mapStateToProps, mapActionsToProps)(ContentDetail);