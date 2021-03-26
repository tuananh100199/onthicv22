import React from 'react';
import { connect } from 'react-redux';
import { getContent } from './redux/reduxContent';

class sectionContent extends React.Component {
    state = {};
    componentDidMount() {
        if (this.props.viewId) {
            this.props.getContent(this.props.viewId, data => data && data.item && this.setState(data.item));
        }
    }

    render() {
        const { title, titleVisible = false, content } = this.state;
        return <div style={{ marginTop: '60px' }}>
            {titleVisible ? <h2>{title}</h2> : null}
            <p dangerouslySetInnerHTML={{ __html: content }} />
        </div>;
    }
}

const mapStateToProps = state => ({ component: state.component });
const mapActionsToProps = { getContent };
export default connect(mapStateToProps, mapActionsToProps)(sectionContent);