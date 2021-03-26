import React from 'react';
import { connect } from 'react-redux';
import { getCourseByUser } from './redux';

class CourseDetail extends React.Component {
    state = {};

    componentDidMount() {
        let url = window.location.pathname,
            params = T.routeMatcher(url.startsWith('/khoahoc/') ? '/khoahoc/:link' : '/course/item/:id').parse(url);
        this.setState({ _id: params.id, link: params.link });
        this.props.getCourseByUser(params.id, params.link);
    }

    componentDidUpdate(prevProps) {
        setTimeout(() => {
            T.ftcoAnimate();
            $('html, body').stop().animate({ scrollTop: 0 }, 500, 'swing');
        }, 250);
        if (prevProps.location.pathname != window.location.pathname) {
            let url = window.location.pathname,
                params = T.routeMatcher(url.startsWith('/khoahoc/') ? '/khoahoc/:link' : '/course/item/:id').parse(url);
            this.setState({ _id: params.id, link: params.link });
            this.props.getCourseByUser(params.id, params.link);
        }
    }

    render() {
        const item = this.props.course && this.props.course.userCourse ? this.props.course.userCourse : null;
        if (item == null) {
            return <p>...</p>;
        } else {
            return (
                <section className='course--content mr-0 pt-5' data-aos='fade-up'>
                    <div className='clever-description p-2'>
                        <div className='about-course mb-30'>
                            <span className='meta'>{new Date(item.createdDate).getText()}</span>
                            <p dangerouslySetInnerHTML={{ __html: item.content }} />
                        </div>
                    </div>
                </section>
            );
        }
    }
}

const mapStateToProps = state => ({ course: state.course });
const mapActionsToProps = { getCourseByUser };
export default connect(mapStateToProps, mapActionsToProps)(CourseDetail);