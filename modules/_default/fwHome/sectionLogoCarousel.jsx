import React from 'react';

const scrollerStyle = { width: '100%', height: '160px', margin: '0 auto', position: 'relative' };
const innerScrollArea = {
    overflow: 'hidden', position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundImage: 'url(/img/loading.gif)',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundSize: 'auto 40%'
};
const scrollerItemStyle = { padding: 0, margin: 0, listStyleType: 'none', position: 'absolute', height: '100%' };
const startLeft = 20000;

export default class LogoCarousel extends React.Component {
    state = { logos: [] };
    loadedImages = 0;

    componentDidMount() {
        const url = this.props.src;
        $.get(T.url(url)).then(data => {
            if (data.error) {
                T.notify('Lấy hình ảnh bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                this.setState({ logos: data.items ? data.items : [] });
            }
        }).catch(error => {
            T.notify('Lấy hình ảnh bị lỗi!', 'danger');
            console.error('GET: ' + url + '. ' + error);
        });
    }

    onImageLoad = (e) => {
        let speed = 1;
        const margin = 6,
            numOfLogos = this.state.logos.length,
            container = $(e.target).parent().parent().hover(() => speed = 0, () => speed = 1);
        const onLoad = () => {
            this.loadedImages++;
            const items = container.children();

            if (this.loadedImages < numOfLogos) {
                container.parent().css('background', '');
                let nextIndex = items.length,
                    lastLink = items.eq(nextIndex - 1),
                    logo = this.state.logos[nextIndex];

                lastLink.clone().appendTo(container)
                    .attr('href', logo.link).css('left', lastLink.position().left + lastLink.width() + margin)
                    .children().eq(0).attr({ src: logo.image, alt: logo.title }).one('load', onLoad);
            } else {
                let lastItem = items.eq(items.length - 1),
                    nextLeft = lastItem.position().left + lastItem.width() + margin;
                while (nextLeft - startLeft < 2048) {
                    for (let i = 0; i < numOfLogos; i++) {
                        nextLeft += items.eq(i).clone().css('left', nextLeft).appendTo(container).width() + margin;
                    }
                }

                setInterval(() => {
                    let left = container.position().left;
                    if (left % 100 == 0) {
                        for (let i = 0, items = container.children(); i < items.length; i++) {
                            let item = items.eq(i);
                            if (left + item.position().left + item.width() <= 0) {
                                nextLeft += item.css('left', nextLeft).width() + margin;
                                break;
                            }
                        }
                    }

                    container.css('left', left - speed);
                }, 60);
            }
        }
        onLoad();
    }

    render() {
        let firstImage;
        if (this.state.logos.length > 0) {
            const logo = this.state.logos[0];
            firstImage =
                <a href={logo.link} style={Object.assign({}, scrollerItemStyle, { left: -startLeft })} target='_blank'>
                    <img src={logo.image} alt={logo.title} width='auto' height='100%' onLoad={this.onImageLoad} />
                </a>
        }

        return (
            <div style={Object.assign({}, scrollerStyle, this.props.style)}>
                <div style={innerScrollArea}>
                    <div style={{ left: startLeft, padding: 0, margin: 0, position: 'relative', height: '100%' }}>
                        {firstImage}
                    </div>
                </div>
            </div>
        );
    }
}