import { connect } from 'react-redux';

const isThennable = obj => obj && typeof obj === 'object' && obj.hasOwnProperty('then');

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
    (dispatch) => ({
        load: resourceProps => {
            const maybePromise = load(resourceProps);
            return isThennable(maybePromise) ? maybePromise : dispatch(maybePromise);
        },
        update: (response, props) => dispatch(update(response, props))
    })
)(Resource);

export default createResource;
