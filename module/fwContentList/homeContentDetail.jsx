import React from 'react';
import { connect } from 'react-redux';
import T from '../../view/js/common.js';
import { getContent } from '../fwHome/redux/reduxContent.jsx';
import SectionAllContent from './sectionAllContent.jsx';

class ContentDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        const route = T.routeMatcher('/content/item/:id'),
            params = route.parse(window.location.pathname);
        this.setState({ _id: params.id });
        this.props.getContent(params.id);
    }

    componentDidUpdate(prevProps) {
        setTimeout(() => {
            T.ftcoAnimate();
            $('html, body').stop().animate({ scrollTop: 0 }, 500, 'swing');
        }, 250);
        if (prevProps.location.pathname != window.location.pathname) {
            const route = T.routeMatcher('/content/item/:id'),
                params = route.parse(window.location.pathname);
            this.setState({ _id: params.id });
            this.props.getContent(params.id);
        }
    }

    render() {
        const item = this.props.content ? this.props.content : null;
        if (item == null) {
            return <p>...</p>;
        } else {
            // let categories = !item.categories ? [] : item.categories.map((item, index) =>
            //     <div key={index} className='bg-black pb-1 px-2 mb-2 text-white d-inline-block rounded mr-1'>
            //         <span><small>{T.language.parse(item.title)}</small></span>
            //     </div>
            // );
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
                                            {/* <span className="meta">{new Date(item.createdDate).getText()}</span> */}
                                            <p className="text-center">
                                                <img src={item.image} alt="Image" className="img-fluid" style={{ width: '30%', height: 'auto' }} />
                                            </p>
                                            <h4 className='text-black text-left'>Nội dung bài viết</h4>
                                            <p dangerouslySetInnerHTML={{ __html: T.language.parse(item.content) }} />
                                            {/* {categories} */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='col-12 col-lg-4 mr-0 pt-5' data-aos='fade-up'>
                                <div className='sidebar-widget'>
                                    <SectionAllContent />
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