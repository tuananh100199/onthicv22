import React from 'react';
import { connect } from 'react-redux';
import { getCourseFeed } from './redux.jsx';
import { Link } from 'react-router-dom';

class SectionCourse extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    componentDidMount() {
        this.props.getCourseFeed();
    }

    render() {
        const courseFeed = this.props.course && this.props.course.courseFeed ? this.props.course.courseFeed : [];
        let course = null;
        if (courseFeed && courseFeed.length) {
            course = courseFeed.map((item, index) => {
                const link = item.link ? '/tintuc/' + item.link : '/course/item/' + item._id;
                return (
                    <div key={index}>
                        <div className='row ml-0'>
                            <div style={{ width: '150px', padding: '15px 15px 15px 0px' }} className={index < courseFeed.length - 1 ? 'border-bottom' : ''}>
                                <Link to={link}>
                                    <img src={item.image} style={{ height: '95px', width: '100%' }} alt='Image' className='img-fluid' />
                                </Link>
                            </div>
                            <div style={{ width: 'calc(100% - 165px)', marginRight: '15px' }} className={index < courseFeed.length - 1 ? 'border-bottom' : ''}>
                                <div className='text'>
                                    <div className='text-inner' style={{ paddingLeft: '15px' }}>
                                        <h2 className='heading pb-0 mb-0'>
                                            <Link to={link} className='text-black'>{T.language.parse(item.title)}</Link>
                                        </h2>
                                        <p style={{ fontSize: '13px', height: '75px', overflow: 'hidden' }}>{T.language.parse(item.abstract)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })
        }
        return (
            <div className='mt-2'>
                <div className='text-left pl-4 mb-1 py-1' style={{ backgroundColor: '#4d983c' }}>
                    <h3 className='text-white'>Tin Tức Mới Nhất</h3>
                </div>
                <div>
                    {course}
                    {/* <button className='expand-btn' onClick={this.handleClickExpand}>
                       {T.language.parse('{ "vi": "Xem thêm...", "en": "See more..." }')}
                    </button> */}
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getCourseFeed };
export default connect(mapStateToProps, mapActionsToProps)(SectionCourse);