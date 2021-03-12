import React from 'react';
import { connect } from 'react-redux';
import { getAllCourseTypeByUser } from './redux';
import { Link } from 'react-router-dom';
import inView from 'in-view';

class SectionCTypeList extends React.Component {
    state = {};
    loading = false;

    constructor(props) {
        super(props);
        this.state = {
            viewMode: T.cookie('viewMode')
        }
    }

    ready = () => {
        inView('.listViewLoading').on('enter', () => {
            let items = this.props.courseType.page;
            if (!this.loading && this.props.getAllCourseTypeByUser && items) {
                this.loading = true;
                this.props.getAllCourseTypeByUser(() => this.loading = false);
            }
        });
    }

    componentDidMount() {
        this.props.getAllCourseTypeByUser(() => this.loading = false);
    }

    render() {
        let items = this.props.courseType ? this.props.courseType.page.list : null;
        if (items) {
            items = items.map((item, index) => {
                return (
                    <div className='col-xl-4 col-md-6 service_col' key={index}  >
                        <div className='text-center'>
                            <div className='service_title'><Link to={'/course-type/' + item._id}>{item.title}</Link></div>
                            <div className='service_text'>
                                <p>{item.shortDescription}</p>
                            </div>
                        </div>
                    </div>
                );
            });
        }
        return (
            <>
                <div>
                    <div className='service_col text-center' style={{ marginBottom: '30px' }}>
                        <div><h2>Loại khóa học</h2></div>
                    </div>
                </div>
                <div className='row'>{items}</div>
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, courseType: state.courseType });
const mapActionsToProps = { getAllCourseTypeByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionCTypeList);
