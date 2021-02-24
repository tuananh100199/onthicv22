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
        this.props.getCourseFeed(() => T.ftcoAnimate());
    }

    render() {
        const courseFeed = this.props.course && this.props.course.courseFeed ? this.props.course.courseFeed : [];
        let course = null;
        if (courseFeed && courseFeed.length) {
            course = courseFeed.map((item, index) => {
                let { image, title, abstract } = item ? item : { image: '', title: '', abstract: '' };
                const link = item.link ? '/khoa-hoc/' + item.link : '/course/item/' + item._id;
                return (
                    <div className='col-lg-4 col-md-6 col-12 team_col ftco-animate' key={index}>
                        <div className='team_item text-center d-flex flex-column aling-items-center justify-content-end'>
                            <div className='team_image'><Link to={link}><img src={image} alt={title} /></Link></div>
                            <div className='team_content text-center'>
                                <div className='team_name'><Link to={link}>{title}</Link></div>
                                {/*<div className='team_title'>Plastic Surgeon</div>*/}
                                <div className='team_text'>
                                    <p>{abstract}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })
        }
        return (
            <div className='team'>
                <div className='container'>
                    <div className='row'>
                        <div className='col'>
                            <div className='section_title_container text-center'>
                                {/*<div className='section_subtitle'>This is Dr Pro</div>*/}
                                <div className='section_title ftco-animate'><h2>Khóa học mới nhất</h2></div>
                            </div>
                        </div>
                    </div>
                    <div className='row team_row'>
                        {course}
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getCourseFeed };
export default connect(mapStateToProps, mapActionsToProps)(SectionCourse);