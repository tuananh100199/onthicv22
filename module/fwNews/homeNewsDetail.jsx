import React from 'react';
import { connect } from 'react-redux';
import T from '../../view/js/common.js';
import { getNewsByUser } from './redux.jsx';
// import SectionSideBar from '../../view/component/SectionSideBar.jsx';

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
        console.log(this.state._id)
        console.log(this.props)
        if (item == null) {
            return <p>...</p>;
        } else {
            let categories = !item.categories ? [] : item.categories.map((item, index) =>
                <div key={index} className='bg-black pb-1 px-2 mb-2 text-white d-inline-block rounded mr-1'>
                    <span><small>{T.language.parse(item.title)}</small></span>
                </div>
            );
            return (
                <section>
                    <div className='site-section bg-light' data-aos='fade-up'>
                        <div className='container-fluid'>
                            <div className='row align-items-first'>
                                <div className='col-12 col-md-8'>
                                    <div className='bg-white'>
                                        <div className='p-3 p-lg-5 border'>
                                            <span className="meta">{new Date(item.createdDate).getText()}</span>
                                            <h2 className='text-black text-center'>{T.language.parse(item.title)}</h2>
                                            <p dangerouslySetInnerHTML={{ __html: T.language.parse(item.content) }} />
                                            {categories}
                                        </div>
                                    </div>
                                </div>
                                <div className='col-12 col-md-4 sidebar' data-aos='fade-up'>
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