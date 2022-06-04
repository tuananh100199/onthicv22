import React from 'react';
import { connect } from 'react-redux';
import { getLawByUser } from './redux';

class NewsDetail extends React.Component {
    state = {};
    componentDidMount() {
        let url = window.location.pathname,
            params = T.routeMatcher('/law/:id').parse(url);
        this.setState({ _id: params.id });
        this.props.getLawByUser(params.id, () => $(this.background).parallax());
    }

    componentWillUnmount() {
        $('.parallax-mirror').length != 0 && $(this.background).parallax('destroy');
    }

    componentDidUpdate(prevProps) {
        setTimeout(() => {
            T.ftcoAnimate();
            $('html, body').stop().animate({ scrollTop: 0 }, 500, 'swing');
        }, 250);

        if (prevProps.location.pathname != window.location.pathname) {
            let url = window.location.pathname,
                params = T.routeMatcher('/law/:_id').parse(url);
            this.setState({ _id: params.id });
            $('.parallax-mirror').length != 0 && $(this.background).parallax('destroy');
            this.props.getLawByUser(params.id, (data) => {
                if (data.item) {
                    $(this.background).parallax({ imageSrc: data.item.image });
                }
            });
        }
    }

    render() {
        const item = this.props.law && this.props.law.userLaw ? this.props.law.userLaw : null;
        if (item == null) {
            return <p>...</p>;
        } else {
            return <>
                <div className='home-contact d-flex flex-column align-items-start justify-content-end'>
                    <div ref={e => this.background = e} className='parallax_background parallax-window' data-parallax='scroll' data-image-src={item ? item.image : '/img/avatar.jpg'} data-speed='0.8' />
                    <div className='home_overlay'><img src='/img/home_overlay.png' alt='' /></div>
                    <div className='home_container'>
                        <div className='container'>
                            <div className='row'>
                                <div className='col'>
                                    <div className='home_content ftco-animate'>
                                        <div className='home_text_content'>
                                            <div className='home_title'>{item.title}</div>
                                            <div className='home_text'>{item.abstract}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='contact'>
                    <div className='container'>
                        <div className='row'>
                            <div className='col-12'>
                                <div className='contact_content'>
                                    <div className='contact_content_title ftco-animate'>{item.title}</div>
                                    <div className='section_subtitle ftco-animate' style={{ lineHeight: 1.4 }}>{item.abstract}</div>
                                    <div className='contact_info ftco-animate'>
                                        <p dangerouslySetInnerHTML={{ __html: item.content }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>;
        }
    }
}

const mapStateToProps = state => ({ law: state.communication.law });
const mapActionsToProps = { getLawByUser };
export default connect(mapStateToProps, mapActionsToProps)(NewsDetail);