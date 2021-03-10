import React from 'react';
import { connect } from 'react-redux';
import T from '../../view/js/common.js'
import { getAllCourseTypeByUser } from './redux.jsx';
import { Link } from 'react-router-dom';

class SectionCTypeDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: {}, items: {} };
    }

    componentDidMount() {
        this.props.getAllCourseTypeByUser();
        T.ftcoAnimate();
    }
    componentDidUpdate(prevProps) {
        setTimeout(() => {
            T.ftcoAnimate();
            $('html, body').stop().animate({ scrollTop: 0 }, 500, 'swing');
        }, 250);
        if (prevProps.location.pathname != window.location.pathname) {
            let url = window.location.pathname,
                params = T.routeMatcher('/course-type/:courseTypeId').parse(url);
            this.setState({ item: this.props.courseType.page.list.find((item) => item._id === params.courseTypeId) })
        }
    }

    render() {
        let items = this.props.courseType ? this.props.courseType.page.list : null;
        let url = window.location.pathname,
            params = T.routeMatcher('/course-type/:courseTypeId').parse(url);
        let item = items ? items.find((item) => item._id === params.courseTypeId) : null;
        let itemList = null;
        if (items && items.length) {
            itemList = items.map((item, index) => {
                return (
                    <div key={index} className='row ml-0 ftco-animate'>
                        <div style={{ width: '300px', marginRight: '15px', paddingTop: '15px' }} className={index < items.length - 1 ? 'border-bottom' : ''}>
                            <div className='text'>
                                <div className='text-inner' style={{ paddingLeft: '15px' }}>
                                    <h6 className='heading pb-0 mb-0'>
                                        <Link to={'/course-type/' + item._id} style={{ color: '#4CA758' }}>{item.title}</Link>
                                    </h6>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })
        }
        if (item == null) {
            return <p>...</p>;
        } else {
            return [
                <div className='contact' style={{
                    marginTop: '120px'
                }}>
                    <div className='container-fluid'>
                        <div className='row'>
                            <div key={1} className='col-xl-8 col-lg-6 col-12'>
                                <div className='contact_content'>
                                    <div className='contact_content_title ftco-animate text-center'>{item.title}</div>
                                    <div className='contact_info ftco-animate'>
                                        <p dangerouslySetInnerHTML={{ __html: item.detailDescription }} />
                                    </div>
                                </div>
                            </div>
                            <div key={2} className='col-xl-4 col-lg-6 col-12'>
                                <div className='contact_form_container'>
                                    <div className='contact_form_title'>Loại khóa học mới nhất</div>
                                    <div>{itemList}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ];
        }
    }
}

const mapStateToProps = state => ({ system: state.system, courseType: state.courseType });
// const mapActionsToProps = { getCourseTypeByUser, getAllCourseTypeByUser };
const mapActionsToProps = { getAllCourseTypeByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionCTypeDetail);