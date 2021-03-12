import React from 'react';
import { connect } from 'react-redux';
import { getClusterAll, createCluster, resetCluster, deleteCluster, getSystemImageAll, applySystemImage, deleteSystemImage } from './redux';

class AdminPage extends React.Component {
    componentDidMount() {
        this.props.getSystemImageAll();
        this.props.getClusterAll();
        T.socket.on('workers-changed', () => this.props.getClusterAll());
        T.ready('/user/settings');
    }
    componentWillUnmount() {
        T.socket.off('workers-changed');
    }

    createCluster = (e) => {
        e.preventDefault();
        this.props.createCluster();
    }
    resetCluster = (e, item) => {
        e.preventDefault();
        T.confirm('Reset cluster', `Are you sure you want to reset cluster ${item.pid}?`, true, isConfirm => isConfirm && this.props.resetCluster(item.pid));
    }
    deleteCluster = (e, item) => {
        e.preventDefault();
        T.confirm('Delete cluster', `Are you sure you want to delete cluster ${item.pid}?`, true, isConfirm => isConfirm && this.props.deleteCluster(item.pid));
    }
    resetAllClusters = (e) => {
        e.preventDefault();
        T.confirm('Delete cluster', 'Are you sure you want to reset all clusters?', true, isConfirm => isConfirm && this.props.resetCluster());
    }

    refreshSystemImages = (e) => {
        e.preventDefault();
        this.props.getSystemImageAll();
    }
    applySystemImage = (e, item) => {
        e.preventDefault();
        let applyButton = $(e.target);
        if (applyButton.is('i')) applyButton = applyButton.parent();
        const deleteButton = applyButton.next();
        T.confirm('Apply cluster', `Are you sure you want to apply image ${item.filename}?`, true, isConfirm => {
            if (isConfirm) {
                applyButton.fadeOut();
                deleteButton.fadeOut();
                this.props.applySystemImage(item.filename, () => {
                    applyButton.fadeIn();
                    deleteButton.fadeIn();
                });
            }
        });
    }
    deleteSystemImage = (e, item) => {
        e.preventDefault();
        T.confirm('Delete image', `Are you sure you want to delete image ${item.filename}?`, true, isConfirm =>
            isConfirm && this.props.deleteSystemImage(item.filename));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionUpdate = currentPermissions.includes('cluster:write'),
            permissionDelete = currentPermissions.includes('cluster:delete');

        const clusters = this.props.cluster && this.props.cluster.clusters ? this.props.cluster.clusters : [],
            clusterTable = clusters && clusters.length > 0 ? (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Id</th>
                            <th style={{ width: '100%' }} nowrap='true'>Image name</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Image version</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Start date</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Status</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clusters.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td style={{ textAlign: 'center' }}>{item.pid}</td>
                                <td>{item.imageInfo}</td>
                                <td style={{ textAlign: 'center' }}>{item.version}</td>
                                <td nowrap='true'>{new Date(item.createdDate).getShortText()}</td>
                                <td className={item.status == 'running' ? 'text-primary' : 'text-danger'}>{item.status}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group'>
                                        {permissionUpdate &&
                                            <a className='btn btn-success' href='#' onClick={e => this.resetCluster(e, item)}>
                                                <i className='fa fa-lg fa-refresh' />
                                            </a>}
                                        {permissionDelete && clusters.length > 1 &&
                                            <a className='btn btn-danger' href='#' onClick={e => this.deleteCluster(e, item)}>
                                                <i className='fa fa-trash-o fa-lg' />
                                            </a>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : 'No cluster!';

        const images = this.props.cluster && this.props.cluster.images ? this.props.cluster.images : [],
            imageTable = images && images.length > 0 ? (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }} nowrap='true'>Image name</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Created date</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {images.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()).map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>{item.filename}</td>
                                <td nowrap='true'>{new Date(item.createdDate).getShortText()}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group'>
                                        {permissionUpdate &&
                                            <a className='btn btn-success' href='#' onClick={e => this.applySystemImage(e, item)}>
                                                <i className='fa fa-lg fa-arrow-up' />
                                            </a>}
                                        {permissionDelete &&
                                            <a className='btn btn-danger' href='#' onClick={e => this.deleteSystemImage(e, item)}>
                                                <i className='fa fa-trash-o fa-lg' />
                                            </a>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : 'No image!';

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-braille' /> Cluster</h1>
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>Cluster</h3>
                    <div className='tile-body'>{clusterTable}</div>
                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                        {/* <button className='btn btn-success' type='button' onClick={this.resetAllClusters}>
                            <i className='fa fa-fw fa-lg fa-refresh'/>Reset
                        </button>&nbsp;&nbsp; */}
                        <button className='btn btn-primary' type='button' onClick={this.createCluster}>
                            <i className='fa fa-fw fa-lg fa-plus' />Add
                        </button>
                    </div>
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>System Image</h3>
                    <div className='tile-body'>{imageTable}</div>
                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                        <button className='btn btn-warning' type='button' onClick={this.refreshSystemImages}>
                            <i className='fa fa-fw fa-lg fa-refresh' />Refresh
                        </button>
                    </div>
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, cluster: state.cluster });
const mapActionsToProps = { getClusterAll, createCluster, resetCluster, deleteCluster, getSystemImageAll, applySystemImage, deleteSystemImage };
export default connect(mapStateToProps, mapActionsToProps)(AdminPage);