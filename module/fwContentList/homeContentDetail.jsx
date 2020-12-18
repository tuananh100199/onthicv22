import React from 'react';
import { connect } from 'react-redux';
import T from '../../view/js/common.js';
import { getContent } from '../fwHome/redux/reduxContent.jsx';
import SectionAllContent from './sectionAllContent.jsx';

class ContentDetail extends React.Component {
    state = { _id: null, title: '', active: false, content: '' };

    componentDidMount() {
        const route = T.routeMatcher('/content/item/:contentId'),
            params = route.parse(window.location.pathname);
        this.setState({ _id: params.contentId });
        console.log('state mount', this.state)
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
            const route = T.routeMatcher('/content/item/:contentId'),
                params = route.parse(window.location.pathname);
            this.setState({ _id: params.contentId });
            this.props.getContent(params.contentId);
        }
    }

    render() {
        const item = this.state ? this.state : null;
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
                                <div className='single-course-intro-content text-center'>
                                    <h3>{T.language.parse(item.title)}</h3>
                                </div>
                            </div>
                            <div className='col-12 col-lg-8 pt-5'>
                                <div className='course--content' data-aos='fade-up'>
                                    <div className='clever-description p-2'>
                                        <div className='about-course mb-30'>
                                            {/* <span className="meta">{new Date(item.createdDate).getText()}</span> */}
                                            <p className="text-center">

                                            </p>
                                            <h4 className='text-primary'>Nội dung bài viết</h4>
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