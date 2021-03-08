import React from 'react';
import { connect } from 'react-redux';
import { getAllCourseTypeByUser } from './redux.jsx';
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
        let items = this.props.courseType ? this.props.courseType.page : null;
        if (userPage) {
            items = items.map((item) => {
                return (
                    <div class="row services_row">
                        <div class="col-xl-4 col-md-6 service_col">
                            <div class="service text-center">
                                <div class="service">
                                    <div class="icon_container d-flex flex-column align-items-center justify-content-center ml-auto mr-auto">
                                        <div class="icon"></div>
                                    </div>
                                    <div class="service_title">{item}</div>
                                    <div class="service_text">
                                        <p>Odio ultrices ut. Etiam ac erat ut enim maximus accumsan vel ac nisl. Duis feugiat bibendum orci, non elementum urna.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                );
            });
        }

        if (userPage && userPage.pageNumber < userPage.pageTotal) {
            elements.push(
                <div key={elements.length} style={{ width: '100%', textAlign: 'center' }}>
                    <img alt='Loading' className='listViewLoading' src='/img/loading.gif'
                        style={{ width: '48px', height: 'auto' }} onLoad={this.ready} />
                </div>
            );
        }

        return (
            <div className='blog'>
                <div class="services">
                    <div class="container">
                        <div class="row">
                            <div class="col text-center">
                                <div class="section_title_container">
                                    <div class="section_title"><h2>Loại khóa học</h2></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='container'>
                    <div className='row'>
                        <div className='col'>
                            {elements}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, courseType: state.courseType });
const mapActionsToProps = { getAllCourseTypeByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionCTypeList);