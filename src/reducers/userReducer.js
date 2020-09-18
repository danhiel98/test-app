export default function userReducer(state = {}, action)
{
    switch (action.type) {
        case 'LOG_IN':
            return { user: action.user };
        default:
            return state;
    }
}
