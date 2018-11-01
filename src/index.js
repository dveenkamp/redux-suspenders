import { connect } from 'react-redux';

const Resource = ({ data, load, update, children, ...props }) => {
    if(!data) {
        const promise = load(props).then(response => update(response, props));
        throw promise;
    }

    return children(data);
}

const createResource = (load, select, update) => connect(
    (state, ownProps) => ({
        data: select(state, ownProps)
    }),
    {
        load,
        update
    }
)(Resource);

export default createResource;
