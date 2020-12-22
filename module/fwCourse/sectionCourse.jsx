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
                let { image, title, abstract } = item ? item : {image:'', title:'', abstract:'' };

                const link = item.link ? '/khoahoc/' + item.link : '/course/item/' + item._id;
                return (
                    <div className="col-12 col-md-6"  key={index}>
                        <div className="single-blog-area mb-100 wow fadeInUp" data-wow-delay="250ms" >
                            <img src={image} alt="" />
                            <div className="blog-content">
                                <a href="#" className="blog-headline">
                                    <h4>{title}</h4>
                                </a>
                                <div className="meta d-flex align-items-center">
                                    <a href="#">Sarah Parker</a>
                                        <span><i className="fa fa-circle" aria-hidden="true" /></span>
                                    <a href="#">Art &amp; Design</a>
                                </div>
                                <p>{abstract}</p>
                            </div>
                        </div>
                    </div>
                );
            })
        }
        return (
            <div className='mt-2'>
                <div>
                <section className="blog-area section-padding-100-0">
                        <div className="container">
                            <div className="row">
                                <div className="col-12">
                                <div className="section-heading">
                                    <h3>Khóa Học</h3>
                                </div>
                                </div>
                            </div>
                            <div className="row">
                                {course}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getCourseFeed };
export default connect(mapStateToProps, mapActionsToProps)(SectionCourse);