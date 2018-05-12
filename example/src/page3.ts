import { Router, ViewObj, Dispatch } from 'zaitun';
import { div, ol, li } from 'zaitun/dom';



function init(dispatch: Dispatch, routeParams, router: Router) {
    console.log(router.activeRoute);
    return {
        title: routeParams.title,
        data: router.activeRoute.data
    };
}
function view({ model, dispatch, router }: ViewObj) {
    return div([
        div(model.title),
        ol(model.data.map(fruit => li(fruit)))       
    ]);
}

export default { init, view};
