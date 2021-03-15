import React from 'react';
import { connect } from 'react-redux';
import { getBaiHoc } from './redux/reduxLesson'

class LessonDetail extends React.Component {
    componentDidMount() {
        let url = window.location.pathname,
            params = T.routeMatcher('/user/dao-tao/bai-hoc/view/:baihocId').parse(url);
        this.props.getBaiHoc(params.baihocId)
    }

    render() {
        const lesson = this.props.lesson && this.props.lesson.lesson ? this.props.lesson.lesson : {}
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file' />{'Bài học: ' + lesson.title}</h1>
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ lesson: state.lesson });
const mapActionsToProps = { getBaiHoc };
export default connect(mapStateToProps, mapActionsToProps)(LessonDetail);