import React from 'react';

export default class TextMarquee extends React.Component {
    render() {
        return (
            <marquee behavior='scroll' direction='left' scrollamount='8'
                onMouseOver={event => event.target.stop()} onMouseOut={event => event.target.start()}>
                <a href={T.rootUrl + '/ban-tin-tuyen-dung-tuan-20-21-22-1405-0306/'}
                    style={{ color: 'red', textDecorationLine: 'none' }}
                    onMouseOver={event => event.target.parentElement.stop()}
                    onMouseOut={event => event.target.parentElement.start()}>
                    BẢN TIN TUYỂN DỤNG TUẦN 20-21-22/2018.
                </a>
            </marquee>
        );
    }
}