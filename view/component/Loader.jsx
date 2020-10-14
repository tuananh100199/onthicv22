import React from 'react';

export default class Loader extends React.Component {
    constructor(props) {
        super(props);
        this.state = { show: true };
        this.loader = React.createRef();
    }

    isShown = () => this.state.show

    show = () => {
        const loader = $(this.loader.current);
        loader.length > 0 ? loader.fadeIn('slow') && this.setState({ show: true }) : setTimeout(this.show, 100);
    }

    hide = () => {
        const loader = $(this.loader.current);
        loader.length > 0 ? loader.fadeOut('slow') && this.setState({ show: false }) : setTimeout(this.hide, 100);
    }

    render() {
        return (
            <div ref={this.loader}>
                <div className='spinner' />
            </div>
        );
    }
}