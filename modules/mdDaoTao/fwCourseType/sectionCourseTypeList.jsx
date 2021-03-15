import React from 'react';
import { connect } from 'react-redux';
import { getAllCourseTypeByUser } from './redux';
import { Link } from 'react-router-dom';

class SectionCourseTypeList extends React.Component {
    componentDidMount() {
        this.props.getAllCourseTypeByUser();
    }

    render() {
        const items = this.props.courseType && this.props.courseType ? this.props.courseType.items : null;
        return (
            <div>
                <div className='service_col text-center' style={{ marginBottom: '30px' }}>
                    <div><h2>Loại khóa học</h2></div>
                </div>
                <div className='row'>
                    {items ? items.map((item, index) => (
                        <div className='col-xl-4 col-md-6 service_col' key={index}  >
                            <div className='text-center'>
                                <div className='service_title'><Link to={'/course-type/' + item._id}>{item.title}</Link></div>
                                {item.isPriceDisplayed && <h3 className='service_title'>{T.numberDisplay(item.price ? `Giá : ${item.price} VND` : '')}</h3>}
                                <div className='service_text'>
                                    <p>{item.shortDescription}</p>
                                </div>
                            </div>
                        </div>)) : null}
                </div>
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, courseType: state.courseType });
const mapActionsToProps = { getAllCourseTypeByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionCourseTypeList);
