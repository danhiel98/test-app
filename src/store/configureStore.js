import {
    createStore, // Crea el contenedor del estado de la app
    combineReducers, // Para trabajar con reducers separados
    compose,
    applyMiddleware
} from 'redux';
import reducers from '../reducers';
import persistState from 'redux-localstorage'; // Permite almacenar información de redux al local storage
import { connectRouter } from 'connected-react-router';
import { routerMiddleware } from 'connected-react-router'

const rootReducer = (history) => combineReducers({
    ...reducers,
    router: connectRouter(history)
});

export default function configureStore(history){
    // console.log(history)
    return createStore(
        rootReducer(history),
        compose(
            applyMiddleware(routerMiddleware(history)),
            persistState('user'),
            window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
        ),
    );
}
