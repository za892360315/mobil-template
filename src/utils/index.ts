import { RouteRecordNormalized } from 'vue-router';
export function add(a: number, b: number) {
    return a + b;
}

export function getTitle(name: string, routes: RouteRecordNormalized[]) {
    console.log('%c [ name ]🍉-7', 'font-size:13px; background:pink; color:#bf2c9f;', name);
    const names: string[] = [];
    while (true) {
        names.push(name);
        const currentRouterObj = routes.find((item) => item.name === name);
        const parentRouterObj = routes.find((item) => item.name === currentRouterObj?.meta?.parentRouter);
        if (parentRouterObj) {
            name = parentRouterObj.name as string;
            continue;
        } else {
            break;
        }
    }
    return names.reverse();
}
