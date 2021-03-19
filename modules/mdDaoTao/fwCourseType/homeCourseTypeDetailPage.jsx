import React from 'react';
import { connect } from 'react-redux';
import { getAllCourseTypeByUser } from './redux';
import { Link } from 'react-router-dom';

class HomeCourseTypeDetailPage extends React.Component {
    state = { loading: true };

    componentDidMount() {
        this.props.getAllCourseTypeByUser();
    }

    componentDidUpdate(prevProps) {
        setTimeout(() => {
            T.ftcoAnimate();
            $('html, body').stop().animate({ scrollTop: 0 }, 500, 'swing');
        }, 250);

        const url = window.location.pathname,
            params = T.routeMatcher('/course-type/:_id').parse(url);
        if ((this.state.loading == true || prevProps.location.pathname != url) && this.props.courseType && this.props.courseType.items) {
            this.setState({
                loading: false,
                item: this.props.courseType.items.find(item => item._id === params._id),
            });
        }
    }

    render() {
        const currentItem = this.state.item,
            rightList = ((this.props.courseType ? this.props.courseType.items : null) || []).map((item, index) => (
                <div key={index} className='ftco-animate' style={{ marginRight: '15px', paddingTop: '15px' }} >
                    <Link to={`/course-type/${item._id}`} className='text-primary'>{item.title}</Link>
                </div>));

        return currentItem ? (
            <div className='container' style={{ marginTop: '120px' }}>
                <div className='row'>
                    <div className='col-lg-9 contact_content'>
                        <div className='contact_content_title ftco-animate text-center text-primary'>{currentItem.title}</div>
                        {currentItem.isPriceDisplayed && <h3 className='service_title text-center'>{T.numberDisplay(currentItem.price ? `Giá : ${currentItem.price} VND` : '')}</h3>}
                        <div className='contact_info ftco-animate'>
                            <p dangerouslySetInnerHTML={{ __html: currentItem.detailDescription }} />
                        </div>
                    </div>
                    <div className='col-lg-3 contact_form_container' style={{ paddingTop: '80px', paddingBottom: '20px' }}>
                        <div className='contact_form_title' style={{ width: '80%' }}>Loại khóa học</div>
                        {rightList}
                    </div>
                </div>
            </div>) : null;
    }
}

const mapStateToProps = state => ({ system: state.system, courseType: state.courseType });
const mapActionsToProps = { getAllCourseTypeByUser };
export default connect(mapStateToProps, mapActionsToProps)(HomeCourseTypeDetailPage);