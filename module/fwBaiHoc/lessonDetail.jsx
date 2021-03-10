import React from 'react';
import { connect } from 'react-redux';
import T from '../../view/js/common.js';
import { getBaiHoc } from './redux.jsx'

class LessonDetail extends React.Component {
    constructor(props) {
        super(props);
        this.background = React.createRef();
    }

    componentDidMount() {
        let url = window.location.pathname,
            params = T.routeMatcher('/user/dao-tao/bai-hoc/view/:baihocId').parse(url);
        this.props.getBaiHoc(params.baihocId)
    }


    render() {
        const lesson = this.props.baihoc && this.props.baihoc.lesson ? this.props.baihoc.lesson : {}
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-file' />{'Bài học: ' + lesson.title}</h1>
                        {/* <p dangerouslySetInnerHTML={{ __html: item.title != '' ? 'Tiêu đề: <b>' + item.title + '</b> ' : '' }} /> */}
                    </div>
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ baihoc: state.baihoc });
const mapActionsToProps = { getBaiHoc };
export default connect(mapStateToProps, mapActionsToProps)(LessonDetail);