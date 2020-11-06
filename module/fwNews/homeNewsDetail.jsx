import React from 'react';
import { connect } from 'react-redux';
import T from '../../view/js/common.js';
import { getNewsByUser } from './redux.jsx';
import SectionNews from './SectionNews.jsx';

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
    }

    componentDidUpdate() {
        if (this.state.language != T.language()) {

            this.setState({ language: T.language() });
        }

        setTimeout(() => {
            T.ftcoAnimate();
            $('html, body').stop().animate({ scrollTop: 0 }, 500, 'swing');
        }, 250);
    }

    render() {
        const item = this.props.news && this.props.news.userNews ? this.props.news.userNews : null;
        if (item == null) {
            return <p>...</p>;
        } else {
            let categories = !item.categories ? [] : item.categories.map((item, index) =>
                <div key={index} className='bg-black pb-1 px-2 mb-2 text-white d-inline-block rounded mr-1'>
                    <span><small>{T.language.parse(item.title)}</small></span>
                </div>
            );
            return (
                <section className='row mr-0'>
                    <div className='container'>
                        <div className='row'>
                            <div className='col-12'>
                                <div
                                    className='single-course-intro d-flex align-items-center justify-content-center'
                                    style={{
                                        backgroundImage: 'url(' + item.image + ')',
                                        backgroundPosition: 'center center',
                                        backgroundSize: 'cover',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                >
                                    <div className='single-course-intro-content text-center'>
                                        <h3>{T.language.parse(item.title)}</h3>
                                    </div>
                                </div>
                            </div>
                            <div className='col-12 col-lg-8 pt-5'>
                                <div className='course--content' data-aos='fade-up'>
                                    <div className='clever-description p-2'>
                                        <div className='about-course mb-30'>
                                            <span className="meta">{new Date(item.createdDate).getText()}</span>
                                            <p className="text-center">
                                                <img src={item.image} alt="Image" className="img-fluid" style={{ width: '30%', height: 'auto' }} />
                                            </p>
                                            <h4 className='text-black text-left'>Nội dung tin tức</h4>
                                            <p dangerouslySetInnerHTML={{ __html: T.language.parse(item.content) }} />
                                            {categories}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='col-12 col-lg-4 mr-0 pt-5' data-aos='fade-up'>
                                <SectionNews />
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