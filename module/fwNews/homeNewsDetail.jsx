import React from 'react';
import { connect } from 'react-redux';
import T from '../../view/js/common.js';
import { getNewsByUser } from './redux.jsx';
import SectionNews from './sectionNews.jsx';

class NewsDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = { language: '' };
    }

    componentDidMount() {
        let url = window.location.pathname,
            params = T.routeMatcher(url.startsWith('/tintuc/') ? '/tintuc/:link' : '/news/item/:id').parse(url);
        this.setState({ _id: params.id, link: params.link });
        this.props.getNewsByUser(params.id, params.link);
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    componentDidUpdate(prevProps) {
        if (this.state.language != T.language()) {

            this.setState({ language: T.language() });
        }

        setTimeout(() => {
            T.ftcoAnimate();
            $('html, body').stop().animate({ scrollTop: 0 }, 500, 'swing');
        }, 250);
        if (prevProps.location.pathname != window.location.pathname) {
            let url = window.location.pathname,
                params = T.routeMatcher(url.startsWith('/tintuc/') ? '/tintuc/:link' : '/news/item/:id').parse(url);
            this.setState({ _id: params.id, link: params.link });
            this.props.getNewsByUser(params.id, params.link);
        }
    }

    handleResize = () => {
        const viewportWidth = $(window).width();
        let viewportHeight = $(window).height();
        if (viewportWidth <= 576) { // Small
            viewportHeight *= 0.45
        }
        if (viewportWidth <= 768) { // Medium
            viewportHeight *= 0.65
        }
        if (viewportWidth <= 992) { //Large
            viewportHeight *= 0.8
        }
        $('.slider-content').css('height', viewportHeight);
        this.setState({
            viewportHeight: viewportHeight
        })
    }

    render() {
        
        const item = this.props.news && this.props.news.userNews ? this.props.news.userNews : null;
        if (item == null) {
            return <p>...</p>;
        } else {
            const element = 0;
            let categories = !item.categories ? [] : item.categories.map((item, index) =>
                <div key={index} className='bg-black pb-1 px-2 mb-2 text-white d-inline-block rounded mr-1'>
                    <span><small>{T.language.parse(item.title)}</small></span>
                </div>
            );
            return (
                <section className='row mr-0'>
                    <div className='container-fluid'>
                        <div className='row'>
                            <div className='col-12 px-0'>
                                <div className="owl-theme">                              
                                    <div className='slider-content'
                                        style={{
                                            height: this.state.viewportHeight,
                                            background: `url('${item.image}')`,
                                            backgroundRepeat: 'repeat',
                                            backgroundPosition: 'center',
                                            backgroundSize: 'cover'
                                        }}
                                    >
                                    <div className='inner'>
                                        <h2>{T.language.parse(item.title)}</h2>
                                    </div>
                                </div>
                                </div>
                            </div>
                            <div className='col-12 col-lg-8 pt-5'>
                                <div className='course--content' data-aos='fade-up'>
                                    <div className='clever-description'>
                                        <div className='about-course mb-30'>
                                            <span className="meta">{new Date(item.createdDate).getText()}</span>
                                            <p className="pt-4" dangerouslySetInnerHTML={{ __html: T.language.parse(item.content) }} />
                                            {categories}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='col-12 col-lg-4 mr-0 pt-5 clever-description' data-aos='fade-up'>
                                <div className='sidebar-widget about-course'>
                                    <SectionNews />
                                </div>
                            </div>
                        </div>
                    </div>

                </section>
            );
        }
    }
}

const mapStateToProps = state => ({ news: state.news });
const mapActionsToProps = { getNewsByUser };
export default connect(mapStateToProps, mapActionsToProps)(NewsDetail);