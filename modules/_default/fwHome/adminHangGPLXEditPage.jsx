import React from 'react';
import { connect } from 'react-redux';
import { getHangGPLX, updateHangGPLX } from './redux/reduxHangGPLX';
import { AdminPage, FormRichTextBox, FormTextBox, FormImageBox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class HangGPLXEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/hang-gplx/:_id'),
                params = route.parse(window.location.pathname);
            this.props.getHangGPLX(params._id, data => {
                if (data.error) {
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    const { _id, title, title1, abstract1, title2, abstract2, title3, abstract3, image1 = '/img/avatar.jpg', image2 = '/img/avatar.jpg', image3 = '/img/avatar.jpg' } = data.item;
                    this.itemTitle.focus();
                    this.itemTitle.value(title);
                    this.itemTitle1.value(title1);
                    this.itemAbstract1.value(abstract1);
                    this.imageBox1.setData('hang1:' + _id, image1);
                    this.itemTitle2.value(title2);
                    this.itemAbstract2.value(abstract2);
                    this.imageBox2.setData('hang2:' + _id, image2);
                    this.itemTitle3.value(title3);
                    this.itemAbstract3.value(abstract3);
                    this.imageBox3.setData('hang3:' + _id, image3);
                
                    this.setState({ _id, title, image1, image2, image3 });
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    save = () => {
        const changes = {
            title: this.itemTitle.value().trim(),
            title1: this.itemTitle1.value(),
            abstract1: this.itemAbstract1.value(),
            title2: this.itemTitle2.value(),
            abstract2: this.itemAbstract2.value(),
            title3: this.itemTitle3.value(),
            abstract3: this.itemAbstract3.value(),
        };

        if (!changes.title) {
            T.notify('Tên các hạng giấy phép lái xe trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.updateHangGPLX(this.state._id, changes);
        }
    }

    render() {
        const permission = this.getUserPermission('component');
        return this.renderPage({
            icon: 'fa fa-edit',
            title: 'Hạng giấy phép lái xe: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to='/user/component'>Thành phần giao diện</Link>, 'Hạng giấy phép lái xe'],
            content: (
                <div className='tile'>
                    <div className='tile-body row'>
                        <FormTextBox className='col-md-12' ref={e => this.itemTitle = e} label='Tên' readOnly={!permission.write} onChange={e => this.setState({ title: e.target.value })} />
                        <div className='col-md-8'>
                            <FormTextBox ref={e => this.itemTitle1 = e} label='Tiêu đề hạng 1' readOnly={!permission.write} />
                            <FormRichTextBox ref={e => this.itemAbstract1 = e} label='Mô tả hạng 1' readOnly={!permission.write} rows='6' />
                        </div>
                        <div className='col-md-4'>
                            <FormImageBox ref={e => this.imageBox1 = e} label='Hình 1' uploadType='HangGPLXImage1' image={this.state.image1} readOnly={!permission.write} />
                        </div>

                        <div className='col-md-8'>
                            <FormTextBox ref={e => this.itemTitle2 = e} label='Tiêu đề hạng 2' readOnly={!permission.write} />
                            <FormRichTextBox ref={e => this.itemAbstract2 = e} label='Mô tả hạng 2' readOnly={!permission.write} rows='6' />
                        </div>
                        <div className='col-md-4'>
                            <FormImageBox ref={e => this.imageBox2 = e} label='Hình 2' uploadType='HangGPLXImage2' image={this.state.image2} readOnly={!permission.write} />
                        </div>

                        <div className='col-md-8'>
                            <FormTextBox ref={e => this.itemTitle3 = e} label='Tiêu đề hạng 3' readOnly={!permission.write} />
                            <FormRichTextBox ref={e => this.itemAbstract3 = e} label='Mô tả hạng 3' readOnly={!permission.write} rows='6' />
                        </div>
                        <div className='col-md-4'>
                            <FormImageBox ref={e => this.imageBox3 = e} label='Hình 3' uploadType='HangGPLXImage3' image={this.state.image3} readOnly={!permission.write} />
                        </div>
                        {/* <FormEditor className='col-md-12' ref={e => this.editor = e} height='400px' label='Nội dung' uploadUrl='/user/upload?category=content' readOnly={!permission.write} /> */}
                    </div>
                </div>),
            backRoute: '/user/component',
            onSave: permission.write ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { getHangGPLX, updateHangGPLX };
export default connect(mapStateToProps, mapActionsToProps)(HangGPLXEditPage);