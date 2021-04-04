import React from 'react';
import { connect } from 'react-redux';
import { getNewsByUser } from './redux';
import NewsFeed from 'view/component/NewsFeed';

class NewsDetail extends React.Component {
    state = {};
    componentDidMount() {
        let url = window.location.pathname,
            params = T.routeMatcher(url.startsWith('/tintuc/') ? '/tintuc/:link' : '/news/item/:id').parse(url);
        this.setState({ _id: params.id, link: params.link });
        this.props.getNewsByUser(params.id, params.link, () => $(this.background).parallax());
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
                params = T.routeMatcher(url.startsWith('/tintuc/') ? '/tintuc/:link' : '/news/item/:id').parse(url);
            this.setState({ _id: params.id, link: params.link });
            $('.parallax-mirror').length != 0 && $(this.background).parallax('destroy');
            this.props.getNewsByUser(params.id, params.link, (data) => {
                if (data.item) {
                    $(this.background).parallax({ imageSrc: data.item.image });
                }
            });
        }
    }

    render() {
        const item = this.props.news && this.props.news.userNews ? this.props.news.userNews : null;
        if (item == null) {
            return <p>...</p>;
        } else {
            let categories = !item.categories ? [] : item.categories.map((item, index) =>
                <div key={index} className='bg-black pb-1 px-2 mb-2 text-white d-inline-block rounded mr-1'>
                    <span><small>{item.title}</small></span>
                </div>
            );
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
                    <div className='container-fluid'>
                        <div className='row'>
                            <div className='col-xl-8 col-lg-6 col-12'>
                                <div className='contact_content'>
                                    <div className='contact_content_title ftco-animate'>{item.title}</div>
                                    <div className='section_subtitle ftco-animate' style={{ lineHeight: 1.4 }}>{item.abstract}</div>
                                    <div className='contact_info ftco-animate'>
                                        <p dangerouslySetInnerHTML={{ __html: item.content }} />
                                    </div>
                                </div>
                            </div>
                            <div className='col-xl-4 col-lg-6 col-12'>
                                <NewsFeed />
                            </div>
                        </div>
                    </div>
                </div>
            </>;
        }
    }
}

const mapStateToProps = state => ({ news: state.news });
const mapActionsToProps = { getNewsByUser };
export default connect(mapStateToProps, mapActionsToProps)(NewsDetail);