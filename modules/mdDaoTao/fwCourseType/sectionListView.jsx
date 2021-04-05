import React from 'react';
import { connect } from 'react-redux';
import { getAllCourseTypeByUser } from './redux';
import { Link } from 'react-router-dom';

class SectionListView extends React.Component {
    state = {};
    componentDidMount() {
        this.props.getAllCourseTypeByUser(list => this.setState({ list }));
    }

    render() {
        const list = this.state.list || [];
        return (
            <>
                <div className='service_col text-center'>
                    <h2>Loại khóa học</h2>
                </div>
                <div className='row'>
                    {list ? list.map((item, index) => (
                        <div key={index} className='col-md-4 service_col'>
                            <div className='text-center'>
                                <img style={{ borderRadius: '50%' }} src={item.image} height={100} width={100} alt='' />
                                <div className='service_title'><Link to={'/course-type/' + item._id}>{item.title}</Link></div>
                                {item.isPriceDisplayed && <h3 className='service_title'>{T.numberDisplay(item.price ? `Giá : ${item.price} VND` : '')}</h3>}
                                <div className='service_text'>
                                    <p>{item.shortDescription}</p>
                                </div>
                            </div>
                        </div>)) : null}
                </div>
            </>);
    }
}

const mapStateToProps = state => ({ system: state.system, courseType: state.courseType });
const mapActionsToProps = { getAllCourseTypeByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionListView);
